package com.dinesync.user_service.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.dinesync.user_service.entity.Salary;
import com.dinesync.user_service.service.SalaryService;

@RestController
@RequestMapping("/api/salaries")
public class SalaryController {

    @Autowired
    private SalaryService salaryService;

    @GetMapping
    public List<Salary> getAll() {
        return salaryService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Salary> getById(
            @PathVariable Long id) {
        return salaryService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/month/{month}/year/{year}")
    public List<Salary> getByMonthAndYear(
            @PathVariable Integer month,
            @PathVariable Integer year) {
        return salaryService.getByMonthAndYear(month, year);
    }

    @GetMapping("/user/{userId}")
    public List<Salary> getByUserId(
            @PathVariable Long userId) {
        return salaryService.getByUserId(userId);
    }

    @PostMapping
    public Salary create(@RequestBody Salary salary) {
        return salaryService.save(salary);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Salary> update(
            @PathVariable Long id,
            @RequestBody Salary salary) {
        return salaryService.getById(id)
                .map(existing -> {
                    salary.setSalaryId(id);
                    return ResponseEntity.ok(
                        salaryService.update(salary));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {
        return salaryService.getById(id)
                .map(existing -> {
                    salaryService.delete(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}