package com.blog.admin.controller;

import com.blog.admin.dto.master.*;
import com.blog.admin.service.MasterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/masters")
@RequiredArgsConstructor
public class MasterController {

    private final MasterService masterService;

    @PostMapping("/list")
    public ResponseEntity<MasterResponse> list(@Valid @RequestBody MasterRequest request) {
        return ResponseEntity.ok(masterService.getByCategory(request.getCategory()));
    }
}
