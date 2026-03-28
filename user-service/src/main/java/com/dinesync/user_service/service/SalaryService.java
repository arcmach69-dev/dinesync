package com.dinesync.user_service.service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.dinesync.user_service.entity.Salary;
import com.dinesync.user_service.repository.SalaryRepository;

@Service
public class SalaryService {

    @Autowired
    private SalaryRepository salaryRepository;

    public Salary save(Salary salary) {
        return salaryRepository.save(salary);
    }

    public List<Salary> getAll() {
        return salaryRepository.findAll();
    }

    public Optional<Salary> getById(Long id) {
        return salaryRepository.findById(id);
    }

    public List<Salary> getByMonthAndYear(
            Integer month, Integer year) {
        return salaryRepository.findByMonthAndYear(month, year);
    }

    public List<Salary> getByUserId(Long userId) {
        return salaryRepository.findByUserId(userId);
    }

    public Salary update(Salary salary) {
        return salaryRepository.save(salary);
    }

    public void delete(Long id) {
        salaryRepository.deleteById(id);
    }
}