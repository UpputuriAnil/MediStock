package com.medistock.service;

import com.medistock.entity.Payment;
import com.medistock.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    @Value("${razorpay.key-id:rzp_test_medistock_key_2026}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret:your_razorpay_secret_key_here}")
    private String razorpayKeySecret;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public Map<String, Object> createRazorpayOrder(Double amount, String currency, String medicineName,
            String supplierName) {
        String orderId = "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
        long amountInPaise = Math.round((amount != null ? amount : 0.0) * 100);

        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setAmount(amount);
        payment.setCurrency(currency != null ? currency : "INR");
        payment.setStatus("CREATED");
        payment.setMedicineName(medicineName);
        payment.setSupplierName(supplierName);
        paymentRepository.save(payment);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", orderId);
        response.put("amount", amountInPaise);
        response.put("currency", currency != null ? currency : "INR");
        response.put("key", razorpayKeyId);
        response.put("status", "created");
        return response;
    }

    @Transactional
    public Payment verifyPayment(String orderId, String paymentId, String razorpaySignature, String paymentMethod,
            String medicineId, String medicineName, String supplierName, String userEmail) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElse(new Payment());

        if (payment.getOrderId() == null) {
            payment.setOrderId(orderId);
        }

        payment.setPaymentId(paymentId != null ? paymentId
                : "pay_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14));
        payment.setRazorpaySignature(razorpaySignature);
        payment.setStatus("PAID");
        if (paymentMethod != null) {
            payment.setPaymentMethod(paymentMethod);
        }
        if (medicineId != null)
            payment.setMedicineId(medicineId);
        if (medicineName != null)
            payment.setMedicineName(medicineName);
        if (supplierName != null)
            payment.setSupplierName(supplierName);
        if (userEmail != null)
            payment.setUserEmail(userEmail);
        if (payment.getCreatedAt() == null)
            payment.setCreatedAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAllByOrderByCreatedAtDesc();
    }

    public Map<String, String> getRazorpayConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("keyId", razorpayKeyId);
        config.put("keySecret", razorpayKeySecret != null && razorpayKeySecret.length() > 4
                ? razorpayKeySecret.substring(0, 4) + "••••••••••••"
                : "••••••••••••");
        return config;
    }
}
