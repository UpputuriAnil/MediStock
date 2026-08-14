package com.medistock.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medistock.entity.Medicine;
import com.medistock.entity.Supplier;
import com.medistock.service.MedicineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class MedicineControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private MedicineService medicineService;

    private Medicine sampleMedicine;

    @BeforeEach
    void setUp() {
        MedicineController medicineController = new MedicineController(medicineService);
        mockMvc = MockMvcBuilders.standaloneSetup(medicineController).build();

        sampleMedicine = new Medicine();
        sampleMedicine.setId(1L);
        sampleMedicine.setName("Amoxicillin");
        sampleMedicine.setGenericName("Amoxicillin Trihydrate");
        sampleMedicine.setCategory("Antibiotic");
        sampleMedicine.setDosageForm("Capsule");
        sampleMedicine.setStrength("500mg");
        sampleMedicine.setManufacturer("PharmaCorp Inc.");
        sampleMedicine.setMinStockLevel(50);
        sampleMedicine.setMaxStockLevel(500);
        sampleMedicine.setReorderLevel(100);
        sampleMedicine.setActive(true);
    }

    @Test
    void testCreateMedicine() throws Exception {
        when(medicineService.createMedicine(any(Medicine.class))).thenReturn(sampleMedicine);

        mockMvc.perform(post("/medicines")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleMedicine)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Medicine created successfully"))
                .andExpect(jsonPath("$.data.name").value("Amoxicillin"));
    }

    @Test
    void testUpdateMedicine() throws Exception {
        when(medicineService.updateMedicine(eq(1L), any(Medicine.class))).thenReturn(sampleMedicine);

        mockMvc.perform(put("/medicines/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleMedicine)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Medicine updated successfully"));
    }

    @Test
    void testGetMedicineById() throws Exception {
        when(medicineService.getMedicineById(1L)).thenReturn(sampleMedicine);

        mockMvc.perform(get("/medicines/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("Amoxicillin"));
    }

    @Test
    void testGetAllMedicines() throws Exception {
        when(medicineService.getAllMedicines()).thenReturn(List.of(sampleMedicine));

        mockMvc.perform(get("/medicines"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Amoxicillin"));
    }

    @Test
    void testSearchMedicines() throws Exception {
        when(medicineService.searchMedicines("Amox")).thenReturn(List.of(sampleMedicine));

        mockMvc.perform(get("/medicines/search").param("keyword", "Amox"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Amoxicillin"));
    }

    @Test
    void testGetLowStockMedicines() throws Exception {
        when(medicineService.getLowStockMedicines()).thenReturn(List.of(sampleMedicine));

        mockMvc.perform(get("/medicines/low-stock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Amoxicillin"));
    }

    @Test
    void testGetSuppliersByMedicine() throws Exception {
        Supplier supplier = new Supplier();
        supplier.setId(1L);
        supplier.setName("PharmaCorp Inc.");

        when(medicineService.getSuppliersByMedicine(1L)).thenReturn(List.of(supplier));

        mockMvc.perform(get("/medicines/1/suppliers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("PharmaCorp Inc."));
    }

    @Test
    void testDeleteMedicine() throws Exception {
        doNothing().when(medicineService).deleteMedicine(1L);

        mockMvc.perform(delete("/medicines/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Medicine deleted successfully"));
    }
}
