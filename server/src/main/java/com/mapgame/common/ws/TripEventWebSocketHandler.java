package com.mapgame.common.ws;

import cn.hutool.json.JSONUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.net.URI;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 路上事件 WebSocket 推送
 * @author make java
 * @since 2026-06-11
 */
@Slf4j
@Component
public class TripEventWebSocketHandler extends TextWebSocketHandler {

    private final Map<Long, WebSocketSession> playerSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        Long playerId = resolvePlayerId(session);
        if (playerId == null) {
            closeQuietly(session);
            return;
        }
        playerSessions.put(playerId, session);
        log.info("WS 连接 playerId={}", playerId);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long playerId = resolvePlayerId(session);
        if (playerId != null) {
            playerSessions.remove(playerId, session);
            log.info("WS 断开 playerId={}", playerId);
        }
    }

    /**
     * 向玩家推送 JSON 消息
     * @param playerId 玩家ID
     * @param payload 消息体
     */
    public void pushJson(Long playerId, Object payload) {
        if (playerId == null || payload == null) {
            return;
        }
        WebSocketSession session = playerSessions.get(playerId);
        if (session == null || !session.isOpen()) {
            return;
        }
        try {
            session.sendMessage(new TextMessage(JSONUtil.toJsonStr(payload)));
        } catch (IOException e) {
            log.warn("WS 推送失败 playerId={}", playerId, e);
        }
    }

    private Long resolvePlayerId(WebSocketSession session) {
        URI uri = session.getUri();
        if (uri == null || uri.getQuery() == null) {
            return null;
        }
        for (String part : uri.getQuery().split("&")) {
            String[] kv = part.split("=", 2);
            if (kv.length == 2 && Objects.equals(kv[0], "playerId")) {
                try {
                    return Long.parseLong(kv[1]);
                } catch (NumberFormatException e) {
                    return null;
                }
            }
        }
        return null;
    }

    private void closeQuietly(WebSocketSession session) {
        try {
            session.close();
        } catch (IOException e) {
            log.warn("WS 关闭失败", e);
        }
    }
}
