import { useEffect, useState } from "react";
import { erpConection } from "../../controller/erp.hook";
import MesasGrid from "./MesasGrid";

export default function MesasSessionGate() {
    const [hasActiveSession, setHasActiveSession] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function validateActiveSession() {
            const sesionActiva = await erpConection("sessionActive");

            if (!mounted) return;

            if (sesionActiva?.ok) {
                setHasActiveSession(true);
                document.dispatchEvent(new CustomEvent("erp-session-active"));
                return;
            }

            setHasActiveSession(false);
            document.dispatchEvent(new CustomEvent("erp-session-missing"));
        }

        const handleSessionCreated = () => {
            setHasActiveSession(true);
            document.dispatchEvent(new CustomEvent("erp-session-active"));
        };

        const handleSessionClosed = () => {
            setHasActiveSession(false);
            document.dispatchEvent(new CustomEvent("erp-session-missing"));
        };

        document.addEventListener("erp-session-created", handleSessionCreated);
        document.addEventListener("erp-session-closed", handleSessionClosed);
        validateActiveSession();

        return () => {
            mounted = false;
            document.removeEventListener("erp-session-created", handleSessionCreated);
            document.removeEventListener("erp-session-closed", handleSessionClosed);
        };
    }, []);

    if (!hasActiveSession) return null;

    return <MesasGrid />;
}
