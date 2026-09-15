package com.kanhacollection.backend.notification;

import com.kanhacollection.backend.config.RabbitMQConfig;
import com.kanhacollection.backend.notification.dto.OrderCreatedEvent;
import com.kanhacollection.backend.notification.dto.PaymentVerifiedEvent;
import com.kanhacollection.backend.notification.dto.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationConsumer.class);

    @RabbitListener(queues = RabbitMQConfig.EMAIL_QUEUE)
    public void handleEmailNotifications(Object event) {
        log.info("[Email Worker] Processing asynchronous email dispatch for event: {}", event);

        if (event instanceof OrderCreatedEvent orderEvent) {
            log.info("[Email Worker] Dispatching Order Confirmation Email to customer {}", orderEvent.getCustomerEmail());
        } else if (event instanceof PaymentVerifiedEvent paymentEvent) {
            log.info("[Email Worker] Dispatching Payment Receipt Email to customer {}", paymentEvent.getCustomerEmail());
        } else if (event instanceof UserRegisteredEvent userEvent) {
            log.info("[Email Worker] Dispatching Welcome Registration Email to customer {}", userEvent.getEmail());
        }
    }

    @RabbitListener(queues = RabbitMQConfig.SHIPPING_QUEUE)
    public void handleShippingEvents(PaymentVerifiedEvent event) {
        log.info("[Shipping Worker] Auto-creating shipment order for paid order {}", event.getOrderNumber());
    }

    @RabbitListener(queues = RabbitMQConfig.DLQ_QUEUE)
    public void handleDeadLetterMessages(Object message) {
        log.error("[Dead-Letter Worker] Received unhandled or failed message in DLQ: {}", message);
    }
}
