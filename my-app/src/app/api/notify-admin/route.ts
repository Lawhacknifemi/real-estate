import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, displayName, role } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const portalId = process.env.HUBSPOT_PORTAL_ID;
    const formGuid = process.env.HUBSPOT_FORM_GUID;

    if (!portalId || !formGuid) {
      console.warn('HubSpot not configured - skipping admin notification');
      return NextResponse.json({ 
        success: true, 
        message: 'HubSpot not configured' 
      });
    }

    const [firstName, ...lastNameParts] = (displayName || '').split(' ');
    const lastName = lastNameParts.join(' ');

    const hubspotPayload = {
      fields: [
        {
          objectTypeId: '0-1',
          name: 'email',
          value: email
        },
        {
          objectTypeId: '0-1',
          name: 'firstname',
          value: firstName || 'New'
        },
        {
          objectTypeId: '0-1',
          name: 'lastname',
          value: lastName || 'User'
        },
        {
          objectTypeId: '0-1',
          name: 'user_role',
          value: role || 'buyer'
        }
      ],
      context: {
        pageUri: `${request.headers.get('origin') || ''}/login`,
        pageName: 'User Signup'
      }
    };

    const hubspotUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`;

    const response = await fetch(hubspotUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(hubspotPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HubSpot submission failed:', errorText);
      return NextResponse.json(
        { error: 'Failed to notify admin', details: errorText },
        { status: response.status }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Admin notified successfully' 
    });

  } catch (error: any) {
    console.error('Error notifying admin:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
