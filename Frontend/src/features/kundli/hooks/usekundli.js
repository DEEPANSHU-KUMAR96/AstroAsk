import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    generateKundli,
    fetchAllKundlis,
    fetchKundli,
    deleteKundli,
    fetchAIReading,
    clearSelected,
    clearError,
    selectKundlis,
    selectSelected,
    selectReading,
    selectKundliLoading,
    selectReadingLoading,
    selectKundliError,
} from "../state/kundli.slice";

const useKundli = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const kundlis = useSelector(selectKundlis);
    const selected = useSelector(selectSelected);
    const reading = useSelector(selectReading);
    const loading = useSelector(selectKundliLoading);
    const readingLoading = useSelector(selectReadingLoading);
    const error = useSelector(selectKundliError);

    const handleGenerate = async (data) => {
        const res = await dispatch(generateKundli(data));
        if (generateKundli.fulfilled.match(res)) {
            toast.success("Kundli generated successfully! ✨");
            navigate(`/kundli/${res.payload._id}`);
            return res.payload;
        } else {
            toast.error(res.payload || "Failed to generate kundli");
            return null;
        }
    };

    const handleFetchAll = () => dispatch(fetchAllKundlis());

    const handleFetchOne = (id) => dispatch(fetchKundli(id));

    const handleDelete = async (id) => {
        const res = await dispatch(deleteKundli(id));
        if (deleteKundli.fulfilled.match(res)) {
            toast.success("Kundli deleted");
            navigate("/kundli");
        } else {
            toast.error(res.payload || "Failed to delete");
        }
    };

    const handleGetReading = async (id, lang = "en") => {
        const res = await dispatch(fetchAIReading({ id, lang }));
        if (fetchAIReading.rejected.match(res)) {
            toast.error(res.payload || "Failed to generate reading");
        } else {
            toast.success("AI Cosmic Reading revealed! 🔮");
        }
    };

    return {
        kundlis,
        selected,
        reading,
        loading,
        readingLoading,
        error,
        handleGenerate,
        handleFetchAll,
        handleFetchOne,
        handleDelete,
        handleGetReading,
        clearSelected: () => dispatch(clearSelected()),
        clearError: () => dispatch(clearError()),
    };
};

export default useKundli;