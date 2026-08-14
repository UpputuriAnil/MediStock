package com.medistock.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medistock.entity.Medicine;
import com.medistock.entity.Supplier;
import com.medistock.service.SupplierService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class SupplierControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private SupplierService supplierService;

    private Supplier sampleSupplier;

    @BeforeEach
    void setUp() {
        SupplierController supplierController = new SupplierController(supplierService);
        mockMvc = MockMvcBuilders.standaloneSetup(supplierController).build();

        sampleSupplier = new Supplier();
        sampleSupplier.setId(1L);
        sampleSupplier.setName("PharmaCorp Inc.");
        sampleSupplier.setContactPerson("John Smith");
        sampleSupplier.setEmail("contact@pharmacorp.com");
        sampleSupplier.setPhoneNumber("+1234567890");
        sampleSupplier.setAddress("123 Medical Drive");
        sampleSupplier.setCity("New York");
        sampleSupplier.setState("NY");
        sampleSupplier.setPostalCode("10001");
        sampleSupplier.setRating(new BigDecimal("4.50"));
        sampleSupplier.setActive(true);
    }

    @Test
    void testCreateSupplier() throws Exception {
        when(supplierService.createSupplier(any(Supplier.class))).thenReturn(sampleSupplier);

        mockMvc.perform(post("/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleSupplier)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Supplier created successfully"))
                .andExpect(jsonPath("$.data.name").value("PharmaCorp Inc."));
    }

    @Test
    void testUpdateSupplier() throws Exception {
        when(supplierService.updateSupplier(eq(1L), any(Supplier.class))).thenReturn(sampleSupplier);

        mockMvc.perform(put("/suppliers/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleSupplier)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Supplier updated successfully"));
    }

    @Test
    void testGetSupplierById() throws Exception {
        when(supplierService.getSupplierById(1L)).thenReturn(sampleSupplier);

        mockMvc.perform(get("/suppliers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("PharmaCorp Inc."));
    }

    @Test
    void testGetAllSuppliers() throws Exception {
        when(supplierService.getAllSuppliers()).thenReturn(List.of(sampleSupplier));

        mockMvc.perform(get("/suppliers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("PharmaCorp Inc."));
    }

    @Test
    void testSearchSuppliers() throws Exception {
        when(supplierService.searchSuppliers("Pharma")).thenReturn(List.of(sampleSupplier));

        mockMvc.perform(get("/suppliers/search").param("keyword", "Pharma"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("PharmaCorp Inc."));
    }

    @Test
    void testGetMedicinesBySupplier() throws Exception {
        Medicine sampleMedicine = new Medicine();
        sampleMedicine.setId(10L);
        sampleMedicine.setName("Amoxicillin");

        when(supplierService.getMedicinesBySupplier(1L)).thenReturn(List.of(sampleMedicine));

        mockMvc.perform(get("/suppliers/1/medicines"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Amoxicillin"));
    }

    @Test
    void testLinkSupplierToMedicine() throws Exception {
        doNothing().when(supplierService).linkSupplierToMedicine(1L, 10L);

        mockMvc.perform(post("/suppliers/1/medicines/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Supplier linked with medicine successfully"));
    }

    @Test
    void testDeleteSupplier() throws Exception {
        doNothing().when(supplierService).deleteSupplier(1L);

        mockMvc.perform(delete("/suppliers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Supplier deleted successfully"));
    }
}
