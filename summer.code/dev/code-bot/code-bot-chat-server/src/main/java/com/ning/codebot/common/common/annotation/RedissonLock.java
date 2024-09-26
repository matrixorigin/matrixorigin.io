package com.ning.codebot.common.common.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.concurrent.TimeUnit;

/**
 * distributed lock
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface RedissonLock {

    String prefixKey() default "";
    String key();
    /**
     * do not wait -1
     * @return second
     */
    int waitTime() default -1;
    TimeUnit unit() default TimeUnit.MILLISECONDS;

}

