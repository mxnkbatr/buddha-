import { redirect } from 'next/navigation';

export default async function BookingIndexPage(params: { params: Promise<{ locale: string }> }) {
  const { locale } = await params.params;
  const validLocale = (['mn', 'en'].includes(locale) ? locale : 'mn');
  
  // Custom booking page doesn't exist without a monk ID, so we redirect users to the monks page
  redirect(`/${validLocale}/monks`);
}
