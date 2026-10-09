package com.hmdm.rest.filter;

import java.io.IOException;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;

public class SpaFilter implements Filter {

    @Override
    public void init(FilterConfig config) throws ServletException {
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String requestURI = httpRequest.getRequestURI();
        String contextPath = httpRequest.getContextPath();
        String path = requestURI.substring(contextPath.length());

        // Don't redirect REST API calls or static assets with extensions
        if (path.startsWith("/rest/") ||
                path.startsWith("/ws/") ||
                path.matches(".*\\.[a-zA-Z0-9]+$") ||
                path.matches("^/plugins/[a-zA-Z0-9_]*/rest/.*")) {
            chain.doFilter(request, response);
        } else {
            // Redirect all other requests to index.html
            request.getRequestDispatcher("/index.html").forward(request, response);
        }
    }

    @Override
    public void destroy() {
    }
}
