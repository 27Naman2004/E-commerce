package com.kanhacollection.backend.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class RabbitMQConfig {

    public static final String TOPIC_EXCHANGE = "kanha.events";
    public static final String DLX_EXCHANGE = "dlx.exchange";

    public static final String EMAIL_QUEUE = "email.notifications.queue";
    public static final String SHIPPING_QUEUE = "shipping.queue";
    public static final String ANALYTICS_QUEUE = "analytics.queue";
    public static final String DLQ_QUEUE = "dlq.queue";

    public static final String ROUTING_ORDER_CREATED = "order.created";
    public static final String ROUTING_PAYMENT_VERIFIED = "payment.verified";
    public static final String ROUTING_USER_REGISTERED = "user.registered";

    @Bean
    public TopicExchange topicExchange() {
        return new TopicExchange(TOPIC_EXCHANGE);
    }

    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(DLX_EXCHANGE);
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(DLQ_QUEUE).build();
    }

    @Bean
    public Binding deadLetterBinding() {
        return BindingBuilder.bind(deadLetterQueue()).to(deadLetterExchange()).with("deadLetter");
    }

    @Bean
    public Queue emailQueue() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-dead-letter-exchange", DLX_EXCHANGE);
        args.put("x-dead-letter-routing-key", "deadLetter");
        return QueueBuilder.durable(EMAIL_QUEUE).withArguments(args).build();
    }

    @Bean
    public Queue shippingQueue() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-dead-letter-exchange", DLX_EXCHANGE);
        args.put("x-dead-letter-routing-key", "deadLetter");
        return QueueBuilder.durable(SHIPPING_QUEUE).withArguments(args).build();
    }

    @Bean
    public Queue analyticsQueue() {
        return QueueBuilder.durable(ANALYTICS_QUEUE).build();
    }

    @Bean
    public Binding emailOrderBinding() {
        return BindingBuilder.bind(emailQueue()).to(topicExchange()).with(ROUTING_ORDER_CREATED);
    }

    @Bean
    public Binding emailUserBinding() {
        return BindingBuilder.bind(emailQueue()).to(topicExchange()).with(ROUTING_USER_REGISTERED);
    }

    @Bean
    public Binding emailPaymentBinding() {
        return BindingBuilder.bind(emailQueue()).to(topicExchange()).with(ROUTING_PAYMENT_VERIFIED);
    }

    @Bean
    public Binding shippingPaymentBinding() {
        return BindingBuilder.bind(shippingQueue()).to(topicExchange()).with(ROUTING_PAYMENT_VERIFIED);
    }

    @Bean
    public Binding analyticsWildcardBinding() {
        return BindingBuilder.bind(analyticsQueue()).to(topicExchange()).with("*.*");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
