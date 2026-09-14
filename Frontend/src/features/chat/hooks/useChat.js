import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
    createSession, fetchSessions, fetchSession, deleteSession,
    addUserMessage, appendStreamChunk, commitStreamedMessage,
    setStreaming, clearError, clearActiveSession,
    selectSessions, selectActiveSession, selectStreamingText,
    selectIsStreaming, selectChatLoading, selectChatError,
} from "../state/chatSlice";
import { sendMessageStream } from "../services/chatApi";

const useChat = () => {
    const dispatch = useDispatch();

    const sessions = useSelector(selectSessions);
    const activeSession = useSelector(selectActiveSession);
    const streamingText = useSelector(selectStreamingText);
    const isStreaming = useSelector(selectIsStreaming);
    const loading = useSelector(selectChatLoading);
    const error = useSelector(selectChatError);

    const handleCreateSession = async () => {
        const res = await dispatch(createSession());
        if (createSession.fulfilled.match(res)) return res.payload;
        toast.error("Failed to create session");
        return null;
    };

    const handleFetchSessions = () => dispatch(fetchSessions());

    const handleSelectSession = (id) => dispatch(fetchSession(id));

    const handleDeleteSession = async (id) => {
        const res = await dispatch(deleteSession(id));
        if (deleteSession.fulfilled.match(res)) {
            toast.success("Chat deleted");
        }
    };

    const handleSendMessage = async (
        message,
        targetSessionId = null,
        lang = "en",
        imageFile = null,
        imagePreviewUrl = null
    ) => {
        const sid = targetSessionId || activeSession?._id;
        if (!sid || isStreaming) return;

        // Optimistic UI — show user message immediately (with image preview if present)
        dispatch(addUserMessage({
            content: message,
            imageUrl: imagePreviewUrl,
            imageName: imageFile?.name,
        }));
        dispatch(setStreaming(true));

        await sendMessageStream(
            sid,
            message,
            (chunk) => dispatch(appendStreamChunk(chunk)),
            (sessionId, title) => {
                dispatch(commitStreamedMessage({ sessionId, title }));
                dispatch(fetchSessions());
            },
            (err) => {
                dispatch(setStreaming(false));
                toast.error(err || "Something went wrong");
            },
            lang,
            imageFile
        );
    };

    const handleNewChat = async () => {
        dispatch(clearActiveSession());
        return handleCreateSession();
    };

    const handleClearError = () => dispatch(clearError());

    return {
        sessions,
        activeSession,
        streamingText,
        isStreaming,
        loading,
        error,
        handleCreateSession,
        handleFetchSessions,
        handleSelectSession,
        handleDeleteSession,
        handleSendMessage,
        handleNewChat,
        handleClearError,
    };
};

export default useChat;