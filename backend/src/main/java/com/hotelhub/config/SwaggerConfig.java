package com.hotelhub.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI hotelHubOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("HotelHub API")
                        .description("Hotel Booking System API Documentation")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("HotelHub Support")
                                .email("support@hotelhub.com")
                                .url("https://hotelhub.com")));
    }
}
