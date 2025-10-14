interface InputErrorProps {
    error?: string;
}

export default function InputError({ error }: InputErrorProps) {
    if (!error) return null;

    return (
        <p className="text-[#9B2FAC] text-sm mt-1">
            {error}
        </p>
    );
}

