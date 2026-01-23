import React from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';

export const TestPushHook: React.FC = () => {
    const {
        isSupported,
        permission,
        subscription,
        isLoading,
        error,
        isIOS,
        requestPermission,
        subscribe,
        unsubscribe,
        sendTestNotification
    } = usePushNotifications();

    return (
        <div data-testid="test-push-hook" className="p-4">
            <h1>Test Push Hook</h1>

            {/* State Indicators */}
            <div data-testid="status-supported">{isSupported ? 'Supported' : 'Not Supported'}</div>
            <div data-testid="status-permission">{permission || 'null'}</div>
            <div data-testid="status-loading">{isLoading ? 'Loading' : 'Idle'}</div>
            <div data-testid="status-ios">{isIOS ? 'iOS' : 'Not iOS'}</div>
            <div data-testid="status-error">{error || 'No Error'}</div>
            <div data-testid="status-subscription">
                {subscription ? 'Subscribed' : 'Not Subscribed'}
            </div>
            {subscription && (
                <pre data-testid="subscription-json">
                    {JSON.stringify(subscription, null, 2)}
                </pre>
            )}

            {/* Actions */}
            <button
                data-testid="btn-request-permission"
                onClick={() => requestPermission()}
            >
                Request Permission
            </button>

            <button
                data-testid="btn-subscribe"
                onClick={() => subscribe()}
            >
                Subscribe
            </button>

            <button
                data-testid="btn-unsubscribe"
                onClick={() => unsubscribe()}
            >
                Unsubscribe
            </button>

            <button
                data-testid="btn-test-notification"
                onClick={() => sendTestNotification()}
            >
                Send Test Notification
            </button>
        </div>
    );
};
