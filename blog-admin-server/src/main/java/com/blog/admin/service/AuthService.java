package com.blog.admin.service;

import com.blog.admin.dto.auth.*;
import com.blog.admin.exception.BusinessException;
import com.blog.admin.exception.ErrorCode;
import com.blog.admin.mapper.UserMapper;
import com.blog.admin.model.User;
import com.blog.admin.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserMapper userMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${keycloak.token-url}")
    private String tokenUrl;

    @Value("${keycloak.logout-url}")
    private String logoutUrl;

    @Value("${keycloak.client-id}")
    private String clientId;

    @Value("${keycloak.client-secret}")
    private String clientSecret;

    @SuppressWarnings("unchecked")
    public LoginResponse login(LoginRequest request) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "password");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("username", request.getUsername());
        params.add("password", request.getPassword());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                tokenUrl, new HttpEntity<>(params, headers), Map.class);

            Map<String, Object> body = response.getBody();
            String accessToken = (String) body.get("access_token");
            String refreshToken = (String) body.get("refresh_token");
            Integer expiresIn = (Integer) body.get("expires_in");

            User user = userMapper.findByKeycloakId(extractSubFromToken(accessToken));
            Integer userId = user != null ? user.getUserId() : null;

            return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(expiresIn)
                .tokenType("Bearer")
                .user(LoginResponse.UserInfo.builder()
                    .id(userId)
                    .username(request.getUsername())
                    .roles(user != null ? List.of(user.getRole().toLowerCase()) : List.of())
                    .build())
                .build();
        } catch (HttpClientErrorException e) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
    }

    @SuppressWarnings("unchecked")
    public LoginResponse refresh(RefreshRequest request) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "refresh_token");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("refresh_token", request.getRefreshToken());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                tokenUrl, new HttpEntity<>(params, headers), Map.class);
            Map<String, Object> body = response.getBody();

            return LoginResponse.builder()
                .accessToken((String) body.get("access_token"))
                .refreshToken((String) body.get("refresh_token"))
                .expiresIn((Integer) body.get("expires_in"))
                .tokenType("Bearer")
                .build();
        } catch (HttpClientErrorException e) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
    }

    public void logout(RefreshRequest request) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("refresh_token", request.getRefreshToken());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        restTemplate.postForEntity(logoutUrl, new HttpEntity<>(params, headers), Void.class);
    }

    public UserInfoResponse getCurrentUser() {
        String keycloakId = SecurityUtils.getCurrentKeycloakId();
        User user = userMapper.findByKeycloakId(keycloakId);
        if (user == null) throw new BusinessException(ErrorCode.USER_NOT_FOUND);

        return UserInfoResponse.builder()
            .userId(user.getUserId())
            .username(user.getUsername())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .roles(List.of(user.getRole().toLowerCase()))
            .profile(UserInfoResponse.ProfileInfo.builder()
                .displayName(user.getDisplayName())
                .avatarUrl(user.getProfileImageUrl())
                .bio(user.getBio())
                .isPublic(user.getIsPublic())
                .build())
            .build();
    }

    private String extractSubFromToken(String token) {
        // JWT payload部分をデコードしてsubを取得
        String[] parts = token.split("\\.");
        if (parts.length < 2) return null;
        String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
        // 簡易的にsubを抽出
        int idx = payload.indexOf("\"sub\":\"");
        if (idx < 0) return null;
        int start = idx + 7;
        int end = payload.indexOf("\"", start);
        return payload.substring(start, end);
    }
}
