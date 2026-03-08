package com.blog.admin.util;

import java.text.Normalizer;
import java.util.regex.Pattern;

public class SlugUtils {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]+");
    private static final Pattern MULTI_DASH = Pattern.compile("-{2,}");

    public static String generateSlug(String title, int postId) {
        if (title == null || title.isBlank()) {
            return "post-" + postId;
        }

        // 日本語かどうかを判定
        if (title.matches(".*[\\u3000-\\u9FFF\\uF900-\\uFAFF].*")) {
            return "post-" + postId;
        }

        String slug = Normalizer.normalize(title, Normalizer.Form.NFD);
        slug = slug.replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");
        slug = WHITESPACE.matcher(slug).replaceAll("-");
        slug = NON_LATIN.matcher(slug).replaceAll("");
        slug = MULTI_DASH.matcher(slug).replaceAll("-");
        slug = slug.toLowerCase().replaceAll("^-|-$", "");

        if (slug.isEmpty()) {
            return "post-" + postId;
        }
        return slug;
    }
}
