export default function Loader({ text = 'Loading...' }) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted text-sm">{text}</p>
        </div>
    );
}
