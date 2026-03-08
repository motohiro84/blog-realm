package com.blog.admin.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchSyncService {

    @Value("${app.public-api-url}")
    private String publicApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public void syncToSearch(int postId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(
                Map.of("postId", postId), headers);
            restTemplate.postForEntity(publicApiUrl + "/internal/search/sync", entity, Map.class);
        } catch (Exception e) {
            log.error("Failed to sync post {} to Elasticsearch", postId, e);
        }
    }

    public void deleteFromSearch(int postId) {
        try {
            restTemplate.delete(publicApiUrl + "/internal/search/" + postId);
        } catch (Exception e) {
            log.error("Failed to delete post {} from Elasticsearch", postId, e);
        }
    }
}
