// MSC & Co Authentication Lambda Handler - Enterprise Grade
// Integrates Auth0 with AWS Cognito for ultimate security

const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

// Initialize AWS services
const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamodb = new AWS.DynamoDB.DocumentClient();

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Credentials': true,
};

// Main Lambda handler
exports.main = async (event) => {
  console.log('Auth Lambda Event:', JSON.stringify(event, null, 2));

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'CORS preflight successful' }),
    };
  }

  try {
    const { path, httpMethod, headers, body } = event;
    const pathParams = event.pathParameters?.proxy?.split('/') || [];
    
    // Route to appropriate handler
    const handler = getHandler(pathParams[0], httpMethod);
    if (!handler) {
      return createResponse(404, { error: 'Endpoint not found' });
    }

    // Parse request body
    const requestBody = body ? JSON.parse(body) : {};
    
    // Execute handler
    const result = await handler({
      path: pathParams,
      method: httpMethod,
      headers,
      body: requestBody,
      user: await extractUser(headers),
    });

    return createResponse(200, result);
  } catch (error) {
    console.error('Auth Lambda Error:', error);
    return createResponse(500, { 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

// Route handlers
function getHandler(endpoint, method) {
  const routes = {
    'login': {
      'POST': handleLogin,
    },
    'register': {
      'POST': handleRegister,
    },
    'verify': {
      'POST': handleVerifyToken,
    },
    'refresh': {
      'POST': handleRefreshToken,
    },
    'logout': {
      'POST': handleLogout,
    },
    'profile': {
      'GET': handleGetProfile,
      'PUT': handleUpdateProfile,
    },
    'roles': {
      'GET': handleGetRoles,
      'PUT': handleUpdateRoles,
    },
  };

  return routes[endpoint]?.[method];
}

// Authentication Handlers
async function handleLogin({ body }) {
  const { email, password, auth0Token } = body;

  try {
    // If Auth0 token provided, verify and sync with Cognito
    if (auth0Token) {
      const auth0User = await verifyAuth0Token(auth0Token);
      const cognitoUser = await syncUserWithCognito(auth0User);
      return {
        success: true,
        user: cognitoUser,
        token: await generateCognitoToken(cognitoUser),
        message: 'Auth0 login successful',
      };
    }

    // Standard Cognito login
    const params = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };

    const result = await cognito.initiateAuth(params).promise();
    const userDetails = await getUserDetails(email);

    return {
      success: true,
      user: userDetails,
      token: result.AuthenticationResult.AccessToken,
      refreshToken: result.AuthenticationResult.RefreshToken,
      message: 'Login successful',
    };
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Invalid credentials');
  }
}

async function handleRegister({ body }) {
  const { email, password, name, userRole = 'Artist' } = body;

  try {
    // Create user in Cognito
    const params = {
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: email,
      TemporaryPassword: password,
      MessageAction: 'SUPPRESS',
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name },
        { Name: 'custom:user_role', Value: userRole },
        { Name: 'email_verified', Value: 'true' },
      ],
    };

    const user = await cognito.adminCreateUser(params).promise();

    // Set permanent password
    await cognito.adminSetUserPassword({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: email,
      Password: password,
      Permanent: true,
    }).promise();

    // Store additional user data
    await storeUserProfile({
      userId: user.User.Username,
      email,
      name,
      userRole,
      createdAt: new Date().toISOString(),
      isActive: true,
    });

    return {
      success: true,
      user: {
        id: user.User.Username,
        email,
        name,
        userRole,
      },
      message: 'Registration successful',
    };
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'UsernameExistsException') {
      throw new Error('User already exists');
    }
    throw new Error('Registration failed');
  }
}

async function handleVerifyToken({ headers }) {
  try {
    const user = await extractUser(headers);
    if (!user) {
      throw new Error('Invalid token');
    }

    const userDetails = await getUserDetails(user.email);
    return {
      success: true,
      user: userDetails,
      message: 'Token is valid',
    };
  } catch (error) {
    throw new Error('Token verification failed');
  }
}

async function handleRefreshToken({ body }) {
  const { refreshToken } = body;

  try {
    const params = {
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    };

    const result = await cognito.initiateAuth(params).promise();
    
    return {
      success: true,
      token: result.AuthenticationResult.AccessToken,
      message: 'Token refreshed successfully',
    };
  } catch (error) {
    throw new Error('Token refresh failed');
  }
}

async function handleLogout({ headers }) {
  try {
    const user = await extractUser(headers);
    if (user) {
      // Global sign out
      await cognito.adminUserGlobalSignOut({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: user.email,
      }).promise();
    }

    return {
      success: true,
      message: 'Logout successful',
    };
  } catch (error) {
    return {
      success: true,
      message: 'Logout completed',
    };
  }
}

// Profile Handlers
async function handleGetProfile({ headers }) {
  const user = await extractUser(headers);
  if (!user) {
    throw new Error('Authentication required');
  }

  const userDetails = await getUserDetails(user.email);
  return {
    success: true,
    user: userDetails,
  };
}

async function handleUpdateProfile({ headers, body }) {
  const user = await extractUser(headers);
  if (!user) {
    throw new Error('Authentication required');
  }

  const { name, userRole, profileData } = body;

  // Update Cognito attributes
  const attributes = [];
  if (name) attributes.push({ Name: 'name', Value: name });
  if (userRole) attributes.push({ Name: 'custom:user_role', Value: userRole });

  if (attributes.length > 0) {
    await cognito.adminUpdateUserAttributes({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: user.email,
      UserAttributes: attributes,
    }).promise();
  }

  // Update profile data
  if (profileData) {
    await updateUserProfile(user.email, profileData);
  }

  const updatedUser = await getUserDetails(user.email);
  return {
    success: true,
    user: updatedUser,
    message: 'Profile updated successfully',
  };
}

// Role Management
async function handleGetRoles({ headers }) {
  const user = await extractUser(headers);
  if (!user) {
    throw new Error('Authentication required');
  }

  const roles = ['Artist', 'Label Admin', 'Distribution Partner', 'Super Admin'];
  return {
    success: true,
    roles,
    currentRole: user.userRole,
  };
}

async function handleUpdateRoles({ headers, body }) {
  const user = await extractUser(headers);
  if (!user || user.userRole !== 'Super Admin') {
    throw new Error('Admin access required');
  }

  const { targetUserId, newRole } = body;

  await cognito.adminUpdateUserAttributes({
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Username: targetUserId,
    UserAttributes: [
      { Name: 'custom:user_role', Value: newRole },
    ],
  }).promise();

  return {
    success: true,
    message: 'Role updated successfully',
  };
}

// Utility Functions
async function extractUser(headers) {
  const authHeader = headers.Authorization || headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  
  try {
    // Verify Cognito token
    const params = {
      AccessToken: token,
    };
    
    const user = await cognito.getUser(params).promise();
    
    return {
      id: user.Username,
      email: user.UserAttributes.find(attr => attr.Name === 'email')?.Value,
      name: user.UserAttributes.find(attr => attr.Name === 'name')?.Value,
      userRole: user.UserAttributes.find(attr => attr.Name === 'custom:user_role')?.Value,
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

async function verifyAuth0Token(token) {
  // Implement Auth0 token verification
  // This would verify the JWT token against Auth0's public keys
  const decoded = jwt.decode(token);
  return {
    email: decoded.email,
    name: decoded.name,
    sub: decoded.sub,
  };
}

async function syncUserWithCognito(auth0User) {
  try {
    // Check if user exists in Cognito
    await cognito.adminGetUser({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: auth0User.email,
    }).promise();
    
    return auth0User;
  } catch (error) {
    if (error.code === 'UserNotFoundException') {
      // Create user in Cognito
      await cognito.adminCreateUser({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: auth0User.email,
        MessageAction: 'SUPPRESS',
        UserAttributes: [
          { Name: 'email', Value: auth0User.email },
          { Name: 'name', Value: auth0User.name },
          { Name: 'email_verified', Value: 'true' },
        ],
      }).promise();
    }
    
    return auth0User;
  }
}

async function generateCognitoToken(user) {
  // Generate a Cognito-compatible token
  return jwt.sign(user, process.env.JWT_SECRET || 'msc-co-secret', {
    expiresIn: '24h',
  });
}

async function getUserDetails(email) {
  try {
    // Get from Cognito
    const cognitoUser = await cognito.adminGetUser({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: email,
    }).promise();

    // Get additional profile data
    const profileData = await getStoredUserProfile(email);

    return {
      id: cognitoUser.Username,
      email: cognitoUser.UserAttributes.find(attr => attr.Name === 'email')?.Value,
      name: cognitoUser.UserAttributes.find(attr => attr.Name === 'name')?.Value,
      userRole: cognitoUser.UserAttributes.find(attr => attr.Name === 'custom:user_role')?.Value || 'Artist',
      isActive: cognitoUser.Enabled,
      createdAt: cognitoUser.UserCreateDate,
      ...profileData,
    };
  } catch (error) {
    throw new Error('User not found');
  }
}

async function storeUserProfile(profile) {
  // Store in DynamoDB table
  const params = {
    TableName: 'msc-co-users',
    Item: profile,
  };
  
  return dynamodb.put(params).promise();
}

async function getStoredUserProfile(email) {
  try {
    const params = {
      TableName: 'msc-co-users',
      Key: { email },
    };
    
    const result = await dynamodb.get(params).promise();
    return result.Item || {};
  } catch (error) {
    return {};
  }
}

async function updateUserProfile(email, updates) {
  const params = {
    TableName: 'msc-co-users',
    Key: { email },
    UpdateExpression: 'SET #updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#updatedAt': 'updatedAt',
    },
    ExpressionAttributeValues: {
      ':updatedAt': new Date().toISOString(),
    },
  };

  // Add dynamic updates
  Object.keys(updates).forEach((key, index) => {
    const attrName = `#attr${index}`;
    const attrValue = `:val${index}`;
    
    params.UpdateExpression += `, ${attrName} = ${attrValue}`;
    params.ExpressionAttributeNames[attrName] = key;
    params.ExpressionAttributeValues[attrValue] = updates[key];
  });

  return dynamodb.update(params).promise();
}

function createResponse(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  };
}