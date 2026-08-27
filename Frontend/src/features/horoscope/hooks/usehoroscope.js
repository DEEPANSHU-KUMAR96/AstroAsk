import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
    fetchHoroscope,
    fetchTodayHoroscope,
    fetchAllHoroscopes,
    setSelectedSign,
    setSelectedPeriod,
    setSelectedLang,
    appendStreamingChunk,
    setIsStreaming,
    clearHoroscopeError,
    resetStreaming,
    resetHoroscopeState,
    selectHoroscope,
    selectAllHoroscopes,
    selectTodayHoroscope,
    selectSelectedSign,
    selectSelectedPeriod,
    selectSelectedLang,
    selectStreamingContent,
    selectIsStreaming,
    selectHoroscopeLoading,
    selectTodayLoading,
    selectAllLoading,
    selectHoroscopeError,
} from "../state/horoscope.slice";
import { streamHoroscopeApi } from "../services/horoscope.api";

const useHoroscope = () => {
    const dispatch = useDispatch();

    const horoscope = useSelector(selectHoroscope);
    const allHoroscopes = useSelector(selectAllHoroscopes);
    const todayHoroscope = useSelector(selectTodayHoroscope);
    const selectedSign = useSelector(selectSelectedSign);
    const selectedPeriod = useSelector(selectSelectedPeriod);
    const selectedLang = useSelector(selectSelectedLang);
    const streamingContent = useSelector(selectStreamingContent);
    const isStreaming = useSelector(selectIsStreaming);
    const loading = useSelector(selectHoroscopeLoading);
    const todayLoading = useSelector(selectTodayLoading);
    const allLoading = useSelector(selectAllLoading);
    const error = useSelector(selectHoroscopeError);

    const getHoroscope = async ({
        sign = selectedSign,
        period = selectedPeriod,
        lang = selectedLang,
    } = {}) => {
        const res = await dispatch(fetchHoroscope({ sign, period, lang }));
        if (fetchHoroscope.rejected.match(res)) {
            toast.error(res.payload || "Failed to load horoscope");
        }
        return res;
    };

    const getTodayHoroscope = async ({
        sign = selectedSign,
        lang = selectedLang,
    } = {}) => {
        const res = await dispatch(fetchTodayHoroscope({ sign, lang }));
        if (fetchTodayHoroscope.rejected.match(res)) {
            toast.error(res.payload || "Failed to load today's horoscope");
        }
        return res;
    };

    const getAllHoroscopes = async ({
        period = selectedPeriod,
        lang = selectedLang,
    } = {}) => {
        const res = await dispatch(fetchAllHoroscopes({ period, lang }));
        if (fetchAllHoroscopes.rejected.match(res)) {
            toast.error(res.payload || "Failed to load all horoscopes");
        }
        return res;
    };

    const streamHoroscope = async ({
        sign = selectedSign,
        period = selectedPeriod,
        lang = selectedLang,
        signal,
    } = {}) => {
        dispatch(resetStreaming());
        dispatch(setIsStreaming(true));

        try {
            const result = await streamHoroscopeApi(sign, period, lang, {
                signal,
                onChunk: (chunk) => {
                    dispatch(appendStreamingChunk(chunk));
                },
                onComplete: () => {
                    dispatch(setIsStreaming(false));
                },
                onError: (err) => {
                    dispatch(setIsStreaming(false));
                    if (err.name !== "AbortError") {
                        toast.error(err.message || "Streaming failed");
                    }
                },
            });
            return result;
        } catch (err) {
            dispatch(setIsStreaming(false));
            throw err;
        }
    };

    const changeSign = (sign) => dispatch(setSelectedSign(sign));
    const changePeriod = (period) => dispatch(setSelectedPeriod(period));
    const changeLang = (lang) => dispatch(setSelectedLang(lang));
    const clearError = () => dispatch(clearHoroscopeError());
    const reset = () => dispatch(resetHoroscopeState());

    return {
        horoscope,
        allHoroscopes,
        todayHoroscope,
        selectedSign,
        selectedPeriod,
        selectedLang,
        streamingContent,
        isStreaming,
        loading,
        todayLoading,
        allLoading,
        error,
        getHoroscope,
        getTodayHoroscope,
        getAllHoroscopes,
        streamHoroscope,
        changeSign,
        changePeriod,
        changeLang,
        clearError,
        reset,
    };
};

export { useHoroscope };
export default useHoroscope;
