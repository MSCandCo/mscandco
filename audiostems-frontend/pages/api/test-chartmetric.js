export default async function handler(req, res) {
  try {
    console.log('Testing Chartmetric connection...')
    
    // Test token request
    const tokenResponse = await fetch('https://api.chartmetric.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshtoken: process.env.CHARTMETRIC_REFRESH_TOKEN
      })
    })

    console.log('Token response status:', tokenResponse.status)
    const tokenData = await tokenResponse.json()
    console.log('Token response:', tokenData)

    if (!tokenResponse.ok) {
      return res.status(400).json({
        error: 'Token request failed',
        details: tokenData
      })
    }

    // Test a simple API call
    const testResponse = await fetch('https://api.chartmetric.com/api/charts/youtube/videos', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.token}`,
        'Content-Type': 'application/json',
      }
    })

    const testData = await testResponse.json()
    console.log('Test API response:', testData)

    res.status(200).json({
      success: true,
      tokenWorking: tokenResponse.ok,
      apiWorking: testResponse.ok,
      tokenData: tokenData,
      testData: testData
    })

  } catch (error) {
    console.error('Chartmetric test error:', error)
    res.status(500).json({
      error: error.message,
      stack: error.stack
    })
  }
}
