import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import { API_CONFIG } from '../config/apiConfig';

interface SocketContextType {
    connected: boolean;
    subscribe: (destination: string, callback: (message: IMessage) => void) => StompSubscription | undefined;
    publish: (destination: string, body: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token, isAuthenticated } = useAuth();
    const [connected, setConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
                setConnected(false);
            }
            return;
        }

        const client = new Client({
            webSocketFactory: () => new SockJS(API_CONFIG.WS_URL),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            debug: (str) => {
                if (import.meta.env.DEV) console.log('STOMP:', str);
            },
            reconnectDelay: 5000,
            onConnect: () => {
                setConnected(true);
            },
            onDisconnect: () => {
                setConnected(false);
            },
            onStompError: (frame) => {
                console.error('STOMP Error:', frame);
            }
        });

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };
    }, [isAuthenticated, token]);

    const subscribe = useCallback((destination: string, callback: (message: IMessage) => void) => {
        if (!clientRef.current || !connected) {
            // If not connected yet, we might need a way to queue subscriptions
            // For now, assume callers handle retry or use effect
            return undefined;
        }
        return clientRef.current.subscribe(destination, callback);
    }, [connected]);

    const publish = useCallback((destination: string, body: any) => {
        if (clientRef.current && connected) {
            clientRef.current.publish({
                destination,
                body: JSON.stringify(body)
            });
        }
    }, [connected]);

    return (
        <SocketContext.Provider value={{ connected, subscribe, publish }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) throw new Error('useSocket must be used within a SocketProvider');
    return context;
};
