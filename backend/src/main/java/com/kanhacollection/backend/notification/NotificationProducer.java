package com.kanhacollection.backend.notification;

import com.kanhacollection.backend.config.RabbitMQConfig;
import com.kanhacollection.backend.notification.dto.OrderCreatedEvent;
import com.kanhacollection.backend.notification.dto.PaymentVerifiedEvent;
import com.kanhacollection.backend.notification.dto.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationProducer {

    private static final Logger log = LoggerFactory.getLogger(NotificationProducer.class);

    private final RabbitTemplate rabbitTemplate;

    public void sendOrderCreatedEvent(OrderCreatedEvent event) {
        log.info("Publishing OrderCreatedEvent for order {}", event.getOrderNumber());
        rabbitTemplate.convertAndSend(RabbitMQConfig.TOPIC_EXCHANGE, RabbitMQConfig.ROUTING_ORDER_CREATED, event);
    }

    public void sendPaymentVerifiedEvent(PaymentVerifiedEvent event) {
        log.info("Publishing PaymentVerifiedEvent for payment {}", event.getRazorpayPaymentId());
        rabbitTemplate.convertAndSend(RabbitMQConfig.TOPIC_EXCHANGE, RabbitMQConfig.ROUTING_PAYMENT_VERIFIED, event);
    }

    public void sendUserRegisteredEvent(UserRegisteredEvent event) {
        log.info("Publishing UserRegisteredEvent for user {}", event.getEmail());
        rabbitTemplate.convertAndSend(RabbitMQConfig.TOPIC_EXCHANGE, RabbitMQConfig.ROUTING_USER_REGISTERED, event);
    }
}
