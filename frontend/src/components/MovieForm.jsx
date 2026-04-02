import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";

export default function MovieForm({ movie, onClose, onSaved }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        genre: "",
        year: new Date().getFullYear(),
        rating: 5.0,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (movie) {
            setFormData({
                name: movie.name,
                genre: movie.genre,
                year: movie.year,
                rating: movie.rating
            });
        }
    }, [movie]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            if (movie) {
                await updateDoc(doc(db, "movies", movie.id), formData);
            } else {
                await addDoc(collection(db, "movies"), {
                    ...formData,
                    userId: user.id
                });
            }
            onSaved();
        } catch (err) {
            console.error(err);
            setError(err.message || "An error occurred connecting to Firebase");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-400"></div>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">
                            {movie ? "Edit Movie" : "Add Movie"}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Movie Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-500"
                                placeholder="e.g. Inception"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Genre</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.genre}
                                    onChange={e => setFormData({ ...formData, genre: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="e.g. Sci-Fi"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Year</label>
                                <input
                                    type="number"
                                    required
                                    min="1888"
                                    max="2100"
                                    value={formData.year}
                                    onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Rating (0-5)</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    value={formData.rating}
                                    onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                                    className="flex-1 accent-indigo-500"
                                />
                                <span className="w-12 text-center text-indigo-400 font-bold bg-indigo-500/10 py-1 rounded-lg">
                                    {formData.rating.toFixed(1)}
                                </span>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2"
                            >
                                {submitting ? "Saving..." : "Save Movie"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
