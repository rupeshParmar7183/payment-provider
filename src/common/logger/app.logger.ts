export class AppLogger {
    static log(data: any) {
        console.log(`
[INFO] ${data.event}

Timestamp: ${new Date().toISOString()}

CorrelationId: ${data.correlationId}

UserId: ${data.userId ?? 'N/A'}

TransactionId: ${data.transactionId ?? 'N/A'
            }

Details: ${JSON.stringify(data)}

-----------------------------------
`);
    }

    static warn(data: any) {
        console.warn(`
[WARN] ${data.event}

Timestamp: ${new Date().toISOString()}

CorrelationId: ${data.correlationId}

TransactionId: ${data.transactionId ?? 'N/A'
            }

Details: ${JSON.stringify(data)}

-----------------------------------
`);
    }

    static error(data: any) {
        console.error(`
[ERROR] ${data.event}

Timestamp: ${new Date().toISOString()}

CorrelationId: ${data.correlationId}

TransactionId: ${data.transactionId ?? 'N/A'
            }

Error: ${data.error ?? 'Unknown'}

Details: ${JSON.stringify(data)}

-----------------------------------
`);
    }
}