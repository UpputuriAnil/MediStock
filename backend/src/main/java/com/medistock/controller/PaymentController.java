package com.medistock.controller;

import com.medistock.entity.Payment;
import com.medistock.response.ApiResponse;
import com.medistock.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/payments")
@Tag(name = "Payment Management", description = "Razorpay Payment Gateway Integration APIs")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/razorpay/create-order")
    @Operation(summary = "Create Razorpay Order for Medicine Purchase")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createRazorpayOrder(@RequestBody Map<String, Object> request) {
        Double amount = request.get("amount") != null ? Double.parseDouble(request.get("amount").toString()) : 0.0;
        String currency = (String) request.getOrDefault("currency", "INR");
        String medicineName = (String) request.get("medicineName");
        String supplierName = (String) request.get("supplierName");

        Map<String, Object> orderDetails = paymentService.createRazorpayOrder(amount, currency, medicineName, supplierName);
        return ResponseEntity.ok(ApiResponse.success("Razorpay order generated successfully", orderDetails));
    }

    @PostMapping("/razorpay/verify")
    @Operation(summary = "Verify Razorpay Payment Signature and Record Payment")
    public ResponseEntity<ApiResponse<Payment>> verifyPayment(@RequestBody Map<String, String> request) {
        String orderId = request.get("razorpay_order_id");
        String paymentId = request.get("razorpay_payment_id");
        String signature = request.get("razorpay_signature");
        String paymentMethod = request.get("paymentMethod");
        String medicineId = request.get("medicineId");
        String medicineName = request.get("medicineName");
        String supplierName = request.get("supplierName");
        String userEmail = request.get("userEmail");

        Payment payment = paymentService.verifyPayment(
                orderId, paymentId, signature, paymentMethod, medicineId, medicineName, supplierName, userEmail
        );
        return ResponseEntity.ok(ApiResponse.success("Razorpay payment verified & recorded successfully", payment));
    }

    @GetMapping("/history")
    @Operation(summary = "Get all payment transaction logs")
    public ResponseEntity<ApiResponse<List<Payment>>> getPaymentHistory() {
        List<Payment> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(ApiResponse.success(payments));
    }
}
