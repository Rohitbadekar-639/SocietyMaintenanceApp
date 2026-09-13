package com.society.identity.service;

import com.razorpay.Order;
import com.razorpay.Payment;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.society.identity.domain.PaymentStatus;
import com.society.identity.domain.SubscriptionPayment;
import com.society.identity.dto.PaymentDtos.*;
import com.society.identity.exception.ApiExceptions.*;
import com.society.identity.repository.SocietyRepository;
import com.society.identity.repository.SubscriptionPaymentRepository;
import com.society.identity.repository.UserRepository;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class RazorpayPaymentService {

    private static final Logger log = LoggerFactory.getLogger(RazorpayPaymentService.class);
    private static final DateTimeFormatter RECEIPT_DAY =
            DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneId.of("Asia/Kolkata"));

    /** Annual app maintenance + live support (shown to customers). */
    public static final int BASE_MAINTENANCE_RUPEES = 3000;
    /** Internal per-flat monthly rate — not shown in customer UI copy. */
    public static final int PER_FLAT_MONTHLY_RUPEES = 15;
    public static final int MIN_FLAT_COUNT = 1;
    public static final int MAX_FLAT_COUNT = 5000;

    private final SubscriptionPaymentRepository paymentRepository;
    private final SocietyRepository societyRepository;
    private final UserRepository userRepository;

    private final String keyId;
    private final String keySecret;
    private final String webhookSecret;
    private final String currency;

    public RazorpayPaymentService(
            SubscriptionPaymentRepository paymentRepository,
            SocietyRepository societyRepository,
            UserRepository userRepository,
            @Value("${app.razorpay.key-id:}") String keyId,
            @Value("${app.razorpay.key-secret:}") String keySecret,
            @Value("${app.razorpay.webhook-secret:}") String webhookSecret,
            @Value("${app.razorpay.currency:INR}") String currency) {
        this.paymentRepository = paymentRepository;
        this.societyRepository = societyRepository;
        this.userRepository = userRepository;
        this.keyId = sanitizeKey(keyId);
        this.keySecret = sanitizeKey(keySecret);
        this.webhookSecret = sanitizeKey(webhookSecret);
        this.currency = currency == null || currency.isBlank() ? "INR" : currency.trim().toUpperCase();

        if (isConfigured()) {
            String mode = this.keyId.startsWith("rzp_test_") ? "TEST" : this.keyId.startsWith("rzp_live_") ? "LIVE" : "UNKNOWN";
            log.info("Razorpay configured: mode={}, keyIdPrefix={}…{}, secretLength={}",
                    mode,
                    this.keyId.substring(0, Math.min(12, this.keyId.length())),
                    this.keyId.length() > 8 ? this.keyId.substring(this.keyId.length() - 4) : "",
                    this.keySecret.length());
        } else {
            log.warn("Razorpay is NOT configured — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET");
        }
    }

    private static String sanitizeKey(String value) {
        if (value == null) {
            return "";
        }
        // Strip spaces/newlines from dashboard copy-paste (Gmail-style spacing, trailing CR)
        return value.trim().replace(" ", "").replace("\r", "").replace("\n", "");
    }

    public boolean isConfigured() {
        return StringUtils.hasText(keyId) && StringUtils.hasText(keySecret);
    }

    /** Annual = base maintenance + (per-flat monthly × flats × 12). Amount always computed server-side. */
    public static long annualAmountPaise(int flatCount) {
        if (flatCount < MIN_FLAT_COUNT || flatCount > MAX_FLAT_COUNT) {
            throw new BadRequestException("Enter a valid number of flats between "
                    + MIN_FLAT_COUNT + " and " + MAX_FLAT_COUNT + ".");
        }
        long annualRupees = BASE_MAINTENANCE_RUPEES
                + ((long) PER_FLAT_MONTHLY_RUPEES * flatCount * 12L);
        return annualRupees * 100L;
    }

    public static String customerPricingNote() {
        return "This includes ₹"
                + String.format("%,d", BASE_MAINTENANCE_RUPEES)
                + " annual maintenance and live support fees.";
    }

    public SubscriptionPricingResponse pricing() {
        return new SubscriptionPricingResponse(
                isConfigured(),
                isConfigured() ? keyId : null,
                currency,
                BASE_MAINTENANCE_RUPEES,
                MIN_FLAT_COUNT,
                MAX_FLAT_COUNT,
                "Annual society workspace",
                "year",
                customerPricingNote()
        );
    }

    public QuoteResponse quote(QuoteRequest req) {
        int flats = req.flatCount();
        long amountPaise = annualAmountPaise(flats);
        return new QuoteResponse(
                flats,
                amountPaise,
                formatInr(amountPaise),
                BASE_MAINTENANCE_RUPEES,
                customerPricingNote()
        );
    }

    @Transactional
    public CreateOrderResponse createOrder(CreateOrderRequest req) {
        if (!isConfigured()) {
            throw new BadRequestException(
                    "Online payments are not configured yet. Please contact SocietyWale support.");
        }

        String societyCode = req.societyCode().trim();
        String adminEmail = req.adminEmail().trim().toLowerCase();
        String societyName = req.societyName().trim();
        String adminName = req.adminName().trim();
        int flatCount = req.flatCount();
        long amountPaise = annualAmountPaise(flatCount);

        if (societyRepository.existsBySocietyCode(societyCode)) {
            throw new ConflictException("Society code already registered. Choose another code or sign in.");
        }
        if (userRepository.existsByEmail(adminEmail)) {
            throw new ConflictException("Email already in use. Sign in, or use a different email.");
        }

        if (amountPaise < 100) {
            throw new BadRequestException("Subscription amount is misconfigured. Contact SocietyWale support.");
        }

        String receipt = "sw" + RECEIPT_DAY.format(Instant.now())
                + UUID.randomUUID().toString().replace("-", "").substring(0, 8);

        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountPaise);
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", receipt);
            orderRequest.put("payment_capture", 1);
            JSONObject notes = new JSONObject();
            notes.put("societyCode", societyCode);
            notes.put("adminEmail", adminEmail);
            notes.put("societyName", societyName);
            notes.put("flatCount", flatCount);
            notes.put("product", "societywale_annual");
            orderRequest.put("notes", notes);

            Order order = client.orders.create(orderRequest);
            String orderId = order.get("id");

            SubscriptionPayment payment = new SubscriptionPayment();
            payment.setRazorpayOrderId(orderId);
            payment.setAmountPaise(amountPaise);
            payment.setFlatCount(flatCount);
            payment.setCurrency(currency);
            payment.setStatus(PaymentStatus.CREATED);
            payment.setSocietyCode(societyCode);
            payment.setAdminEmail(adminEmail);
            payment.setAdminName(adminName);
            payment.setSocietyName(societyName);
            payment.setReceiptNumber(receipt);
            paymentRepository.save(payment);

            return new CreateOrderResponse(
                    keyId,
                    orderId,
                    amountPaise,
                    formatInr(amountPaise),
                    currency,
                    receipt,
                    flatCount,
                    BASE_MAINTENANCE_RUPEES,
                    "Annual society workspace"
            );
        } catch (RazorpayException ex) {
            String detail = ex.getMessage() == null ? "" : ex.getMessage();
            log.error("Razorpay order creation failed: {}", detail);
            if (detail.toLowerCase().contains("authentication failed")
                    || detail.toLowerCase().contains("invalid key")
                    || detail.contains("BAD_REQUEST_ERROR:Authentication")) {
                throw new BadRequestException(
                        "Razorpay authentication failed. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your env — "
                                + "they must be a matching pair from the same Razorpay mode (Test or Live), then restart identity.");
            }
            if (detail.toLowerCase().contains("amount")) {
                throw new BadRequestException(
                        "Razorpay rejected the payment amount. Please recalculate and try again, or contact SocietyWale support.");
            }
            throw new BadRequestException(
                    "Could not start payment with Razorpay. Please try again in a moment. If this continues, contact SocietyWale support.");
        }
    }

    /**
     * Verifies Razorpay checkout signature + live payment status, then marks the order PAID.
     * Safe to call again for network-retry after checkout success.
     */
    @Transactional
    public SubscriptionPayment verifyAndMarkPaid(String orderId, String paymentId, String signature) {
        if (!isConfigured()) {
            throw new BadRequestException("Online payments are not configured yet.");
        }
        if (!StringUtils.hasText(orderId) || !StringUtils.hasText(paymentId) || !StringUtils.hasText(signature)) {
            throw new BadRequestException("Payment confirmation is incomplete. Please complete Pay Now again.");
        }

        SubscriptionPayment local = paymentRepository.findByRazorpayOrderId(orderId.trim())
                .orElseThrow(() -> new BadRequestException(
                        "Unknown payment order. Please start Pay Now again."));

        if (local.getStatus() == PaymentStatus.CONSUMED) {
            throw new ConflictException(
                    "This payment was already used to create a workspace. Please sign in.");
        }
        if (local.getStatus() == PaymentStatus.FAILED) {
            throw new BadRequestException("This payment failed. Please try Pay Now again.");
        }

        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", orderId.trim());
            attributes.put("razorpay_payment_id", paymentId.trim());
            attributes.put("razorpay_signature", signature.trim());
            boolean valid = Utils.verifyPaymentSignature(attributes, keySecret);
            if (!valid) {
                throw new BadRequestException("Payment signature mismatch. Payment was not accepted.");
            }
        } catch (RazorpayException ex) {
            log.warn("Razorpay signature verification error: {}", ex.getMessage());
            throw new BadRequestException("Could not verify payment. Please try again or contact support.");
        }

        // Prevent the same Razorpay payment id from registering two societies
        paymentRepository.findByRazorpayPaymentId(paymentId.trim()).ifPresent(existing -> {
            if (!existing.getId().equals(local.getId()) && existing.getStatus() == PaymentStatus.CONSUMED) {
                throw new ConflictException("This payment was already used. Contact support if you were charged twice.");
            }
        });

        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            Payment remote = client.payments.fetch(paymentId.trim());
            String status = remote.get("status");
            int amount = remote.get("amount");
            String remoteOrderId = remote.get("order_id");

            if (!orderId.trim().equals(remoteOrderId)) {
                throw new BadRequestException("Payment does not match the checkout order.");
            }
            if (amount != local.getAmountPaise()) {
                throw new BadRequestException("Paid amount does not match the subscription price.");
            }
            if (!"captured".equalsIgnoreCase(status) && !"authorized".equalsIgnoreCase(status)) {
                throw new BadRequestException(
                        "Payment is not complete yet (status: " + status + "). Wait a moment and retry signup.");
            }
        } catch (RazorpayException ex) {
            log.warn("Razorpay payment fetch failed for {}: {}", paymentId, ex.getMessage());
            throw new BadRequestException(
                    "Could not confirm payment with the bank gateway. Check your internet and retry — you will not be charged again if already paid.");
        }

        local.setRazorpayPaymentId(paymentId.trim());
        local.setRazorpaySignature(signature.trim());
        if (local.getStatus() != PaymentStatus.PAID) {
            local.setStatus(PaymentStatus.PAID);
            local.setPaidAt(Instant.now());
        }
        return paymentRepository.save(local);
    }

    @Transactional
    public SubscriptionPayment consumeForRegistration(
            SubscriptionPayment paid,
            String societyCode,
            String adminEmail,
            UUID societyId) {
        if (paid.getStatus() == PaymentStatus.CONSUMED) {
            throw new ConflictException("This payment was already used to create a workspace. Please sign in.");
        }
        if (paid.getStatus() != PaymentStatus.PAID) {
            throw new BadRequestException("Payment is not confirmed yet.");
        }
        if (!paid.getSocietyCode().equalsIgnoreCase(societyCode.trim())) {
            throw new BadRequestException("Society code does not match the paid checkout. Use the same details.");
        }
        if (!paid.getAdminEmail().equalsIgnoreCase(adminEmail.trim())) {
            throw new BadRequestException("Email does not match the paid checkout. Use the same admin email.");
        }
        paid.setStatus(PaymentStatus.CONSUMED);
        paid.setSocietyId(societyId);
        return paymentRepository.save(paid);
    }

    /**
     * Razorpay server webhook — secondary confirmation if the browser drops mid-checkout.
     */
    @Transactional
    public void handleWebhook(String payload, String signatureHeader) {
        if (!StringUtils.hasText(webhookSecret)) {
            log.warn("Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not set — ignored");
            return;
        }
        if (!StringUtils.hasText(signatureHeader) || !verifyWebhookSignature(payload, signatureHeader)) {
            throw new UnauthorizedException("Invalid Razorpay webhook signature");
        }

        JSONObject body = new JSONObject(payload);
        String event = body.optString("event");
        if (!"payment.captured".equals(event) && !"order.paid".equals(event)) {
            return;
        }

        JSONObject paymentEntity = body.optJSONObject("payload") != null
                ? body.getJSONObject("payload").optJSONObject("payment") != null
                ? body.getJSONObject("payload").getJSONObject("payment").optJSONObject("entity")
                : null
                : null;
        if (paymentEntity == null) {
            return;
        }

        String paymentId = paymentEntity.optString("id");
        String orderId = paymentEntity.optString("order_id");
        int amount = paymentEntity.optInt("amount");
        if (!StringUtils.hasText(orderId)) {
            return;
        }

        paymentRepository.findByRazorpayOrderId(orderId).ifPresent(local -> {
            if (local.getStatus() == PaymentStatus.CONSUMED || local.getStatus() == PaymentStatus.PAID) {
                return;
            }
            if (amount > 0 && amount != local.getAmountPaise()) {
                log.warn("Webhook amount mismatch for order {}: expected {}, got {}", orderId, local.getAmountPaise(), amount);
                return;
            }
            local.setRazorpayPaymentId(paymentId);
            local.setStatus(PaymentStatus.PAID);
            local.setPaidAt(Instant.now());
            paymentRepository.save(local);
            log.info("Webhook marked order {} as PAID", orderId);
        });
    }

    private boolean verifyWebhookSignature(String payload, String signatureHeader) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expected = HexFormat.of().formatHex(hash);
            return constantTimeEquals(expected, signatureHeader.trim());
        } catch (Exception ex) {
            log.warn("Webhook signature verify failed: {}", ex.getMessage());
            return false;
        }
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null || a.length() != b.length()) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }

    public static String formatInr(long amountPaise) {
        long rupees = amountPaise / 100;
        long paise = Math.abs(amountPaise % 100);
        if (paise == 0) {
            return "₹" + String.format("%,d", rupees);
        }
        return "₹" + String.format("%,d", rupees) + "." + String.format("%02d", paise);
    }
}
