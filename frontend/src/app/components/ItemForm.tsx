// components/ItemForm.tsx
import { useState } from 'react';

export default function ItemForm() {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        price: '',
    });
    const [image, setImage] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // First upload the image
        if (image) {
            const formData = new FormData();
            formData.append('image', image);

            const uploadRes = await fetch('http://localhost:8080/api/upload', {
                method: 'POST',
                body: formData,
            });
            const uploadData = await uploadRes.json();

            // Then create the item with the image path
            const itemRes = await fetch('http://localhost:8080/api/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    image_path: uploadData.filepath,
                }),
            });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Add your form fields here */}
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
            {/* Add other form fields */}
        </form>
    );
}