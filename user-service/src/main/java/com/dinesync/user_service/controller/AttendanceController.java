package com.dinesync.user_service.controller;

import java.time.LocalDate;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.dinesync.user_service.entity.Attendance;
import com.dinesync.user_service.service.AttendanceService;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @GetMapping
    public List<Attendance> getAll() {
        return attendanceService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Attendance> getById(
            @PathVariable Long id) {
        return attendanceService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/date/{date}")
    public List<Attendance> getByDate(
            @PathVariable String date) {
        return attendanceService.getByDate(
            LocalDate.parse(date));
    }

    @GetMapping("/user/{userId}")
    public List<Attendance> getByUserId(
            @PathVariable Long userId) {
        return attendanceService.getByUserId(userId);
    }

    @GetMapping("/range")
    public List<Attendance> getByDateRange(
            @RequestParam String start,
            @RequestParam String end) {
        return attendanceService.getByDateRange(
            LocalDate.parse(start),
            LocalDate.parse(end));
    }

    @PostMapping
    public Attendance create(
            @RequestBody Attendance attendance) {
        return attendanceService.save(attendance);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Attendance> update(
            @PathVariable Long id,
            @RequestBody Attendance attendance) {
        return attendanceService.getById(id)
                .map(existing -> {
                    attendance.setAttendanceId(id);
                    return ResponseEntity.ok(
                        attendanceService.update(attendance));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {
        return attendanceService.getById(id)
                .map(existing -> {
                    attendanceService.delete(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}