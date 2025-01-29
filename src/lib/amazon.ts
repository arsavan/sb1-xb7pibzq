import { supabase } from './supabase';

interface AmazonCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  partnerTag: string;
  host: string;
}

export async function getAmazonCredentials(): Promise<AmazonCredentials> {
  const { data, error } = await supabase
    .from('amazon_settings')
    .select('*')
    .single();

  if (error) throw error;
  if (!data) throw new Error('Amazon credentials not found');

  return {
    accessKeyId: data.access_key_id,
    secretAccessKey: data.secret_access_key,
    partnerTag: data.partner_tag,
    host: data.host || 'webservices.amazon.fr'
  };
}

export async function searchAmazonProducts(query: string) {
  try {
    const credentials = await getAmazonCredentials();
    
    // Implement the Amazon Product Advertising API v5 search
    // This is a placeholder for the actual implementation
    const response = await fetch(`https://${credentials.host}/paapi5/searchitems`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
        // Add other required headers
      },
      body: JSON.stringify({
        Keywords: query,
        Resources: [
          'ItemInfo.Title',
          'Offers.Listings.Price',
          'Images.Primary.Large',
          'ItemInfo.Features',
          'ItemInfo.ContentInfo',
          'ItemInfo.ProductInfo'
        ],
        PartnerTag: credentials.partnerTag,
        PartnerType: 'Associates',
        Marketplace: 'www.amazon.fr'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Amazon products');
    }

    const data = await response.json();
    return data.SearchResult.Items;
  } catch (error) {
    console.error('Amazon search error:', error);
    throw error;
  }
}