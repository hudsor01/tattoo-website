import { TattooGallery } from "@/components/gallery/tattoo-gallery.tsx"

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <TattooGallery />
      </div>
    </main>
  )
}