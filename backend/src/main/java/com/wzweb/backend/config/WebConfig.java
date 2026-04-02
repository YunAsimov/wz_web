package com.wzweb.backend.config;

import com.wzweb.backend.auth.AuthInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final String DEFAULT_CORS_ALLOWED_ORIGIN_PATTERNS = "http://localhost:*,http://127.0.0.1:*";

    private final AuthInterceptor authInterceptor;
    private final String[] allowedOriginPatterns;

    public WebConfig(
            AuthInterceptor authInterceptor,
            @Value("${CORS_ALLOWED_ORIGIN_PATTERNS:" + DEFAULT_CORS_ALLOWED_ORIGIN_PATTERNS + "}") String allowedOriginPatternsProperty
    ) {
        this.authInterceptor = authInterceptor;
        this.allowedOriginPatterns = Arrays.stream(allowedOriginPatternsProperty.split(","))
                .map(String::trim)
                .filter(pattern -> !pattern.isEmpty())
                .toArray(String[]::new);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns(allowedOriginPatterns)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/login");
    }
}
