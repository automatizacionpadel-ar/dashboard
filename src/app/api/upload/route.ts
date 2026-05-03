// app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

const BASE_URL = process.env.BASEROW_API_URL ?? 'https://baserow.srv1334062.hstgr.cloud/api';
const TOKEN = process.env.BASEROW_TOKEN!;

export async function POST(request: Request) {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session');
  const session = sessionCookie ? await verifyToken(sessionCookie.value) : null;

  if (!session || session.rol !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!validTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Solo se permiten imágenes (JPG, PNG, WEBP, GIF, SVG)' }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'El archivo no debe superar 10 MB' }, { status: 400 });
  }

  try {
    const baserowForm = new FormData();
    baserowForm.append('file', file);

    const res = await fetch(`${BASE_URL}/user-files/upload-file/`, {
      method: 'POST',
      headers: { Authorization: `Token ${TOKEN}` },
      body: baserowForm,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Baserow upload error:', err);
      return NextResponse.json({ error: 'Error al subir el archivo a Baserow' }, { status: 500 });
    }

    const data = await res.json();

    return NextResponse.json({
      name: data.name,
      url: data.url,
      original_name: data.original_name,
      size: data.size,
      mime_type: data.mime_type,
      is_image: data.is_image,
      image_width: data.image_width,
      image_height: data.image_height,
      uploaded_at: data.uploaded_at,
      thumbnails: data.thumbnails,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
