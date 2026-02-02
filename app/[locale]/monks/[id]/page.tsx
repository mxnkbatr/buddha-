import { Metadata, ResolvingMetadata } from 'next';
import MonkProfileClient from './MonkProfileClient';

type Props = {
    params: Promise<{ id: string; locale: string }>
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id, locale } = await params;
    const validLocale = (['mn', 'en'].includes(locale) ? locale : 'mn') as 'mn' | 'en';

    // Fetch data - using absolute URL if needed or relative if internal API logic supports it
    // In Server Components, usually recommend calling DB directly or absolute URL
    // Since we don't have direct DB access configured here comfortably, we'll try the API route with full URL if possible
    // For now using localhost or assuming deployment URL - better to use process.env value
    // Ideally we should import a getMonk fetcher function so we don't depend on self-API call during build
    // But let's try fetch
    let product;
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        product = await fetch(`${baseUrl}/api/monks/${id}`, { next: { revalidate: 3600 } }).then((res) => res.json());
    } catch (e) {
        console.error("Metadata fetch error", e);
        return {
            title: 'Gevabal - Monk Profile',
            description: 'Book a consultation with a Buddhist Monk.'
        }
    }

    if (!product) {
        return {
            title: 'Monk Not Found',
        }
    }

    // Optionally access and extend (rather than replace) parent metadata
    const previousImages = (await parent).openGraph?.images || [];

    return {
        title: `${product.name?.[validLocale]} - Buddhist Monk & Spiritual Guide`,
        description: product.bio?.[validLocale]?.substring(0, 160) || "Spiritual guidance and consultation.",
        openGraph: {
            images: [product.image, ...previousImages],
            locale: validLocale,
            alternateLocale: validLocale === 'mn' ? 'en_US' : 'mn_MN',
        },
        alternates: {
            canonical: `https://gevabal.mn/${validLocale}/monks/${id}`,
            languages: {
                'en': `https://gevabal.mn/en/monks/${id}`,
                'mn': `https://gevabal.mn/mn/monks/${id}`,
            },
        },
    };
}

export default async function MonkPage({ params }: Props) {
    // We need to await params in Next.js 15+, or it's good practice anyway if it might be a promise
    // The type definition above says Promise
    const resolvedParams = await params;
    return <MonkProfileClient />;
}