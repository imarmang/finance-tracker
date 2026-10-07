package com.finance.tracker.logging;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

/**
 * Logs one line for every API response: method, path, status, size and time taken.
 * Response bodies are logged only when {@code app.logging.response-bodies=true}, because they contain financial records.
 */
@Component
public class ResponseLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger("api.responses");
    private static final int MAX_BODY_CHARS = 2000;

    private final boolean logBodies;

    public ResponseLoggingFilter(@Value("${app.logging.response-bodies:false}") boolean logBodies) {
        this.logBodies = logBodies;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        ContentCachingResponseWrapper wrapped = new ContentCachingResponseWrapper(response);
        long start = System.nanoTime();
        try {
            chain.doFilter(request, wrapped);
        } catch (ServletException | IOException | RuntimeException e) {
            log(request, wrapped, start, e);
            throw e;
        }
        log(request, wrapped, start, null);
        wrapped.copyBodyToResponse();
    }

    private void log(HttpServletRequest request, ContentCachingResponseWrapper response, long startNanos, Throwable error) {
        long millis = (System.nanoTime() - startNanos) / 1_000_000;
        String query = request.getQueryString() == null ? "" : "?" + request.getQueryString();
        String line = "{} {}{} -> {} ({} bytes, {} ms)";
        if (error != null) {
            log.warn(line + " failed: {}", request.getMethod(), request.getRequestURI(), query,
                    response.getStatus(), response.getContentSize(), millis, error.getClass().getSimpleName());
        } else {
            log.info(line, request.getMethod(), request.getRequestURI(), query,
                    response.getStatus(), response.getContentSize(), millis);
        }
        if (logBodies && log.isDebugEnabled()) {
            String body = new String(response.getContentAsByteArray(), StandardCharsets.UTF_8);
            if (body.length() > MAX_BODY_CHARS) {
                body = body.substring(0, MAX_BODY_CHARS) + "... (truncated)";
            }
            log.debug("response body for {} {}: {}", request.getMethod(), request.getRequestURI(), body);
        }
    }
}
