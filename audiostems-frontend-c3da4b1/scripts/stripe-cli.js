#!/usr/bin/env node

/**
 * AudioStems Stripe CLI Tool
 * 
 * This tool helps manage Stripe products, prices, and webhooks for the AudioStems platform.
 * 
 * Usage:
 *   node scripts/stripe-cli.js <command> [options]
 * 
 * Commands:
 *   products     - List all products
 *   prices       - List all prices
 *   create-product <name> <description> - Create a new product
 *   create-price <product_id> <amount> <currency> <interval> - Create a new price
 *   webhooks     - List all webhook endpoints
 *   listen       - Start webhook listener for local development
 *   test-webhook - Test webhook endpoint
 *   customers    - List customers
 *   subscriptions - List subscriptions
 *   help         - Show this help message
 */

const Stripe = require('stripe');
const { spawn } = require('child_process');
require('dotenv').config({ path: '.env.local' });

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.cyan}${colors.bright}🚀 ${msg}${colors.reset}`),
};

// Validate Stripe configuration
function validateStripeConfig() {
  if (!process.env.STRIPE_SECRET_KEY) {
    log.error('STRIPE_SECRET_KEY not found in .env.local');
    log.info('Please add your Stripe secret key to .env.local');
    process.exit(1);
  }
  
  if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    log.error('Invalid Stripe secret key format. Should start with "sk_"');
    process.exit(1);
  }
  
  const isTest = process.env.STRIPE_SECRET_KEY.includes('test');
  log.info(`Using ${isTest ? 'TEST' : 'LIVE'} Stripe environment`);
  
  if (!isTest) {
    log.warning('You are using LIVE Stripe keys! Be careful with operations.');
  }
}

// List all products
async function listProducts() {
  try {
    log.header('Stripe Products');
    const products = await stripe.products.list({ limit: 20 });
    
    if (products.data.length === 0) {
      log.info('No products found');
      return;
    }
    
    console.log('\n' + '='.repeat(80));
    products.data.forEach((product, index) => {
      console.log(`${index + 1}. ${colors.bright}${product.name}${colors.reset}`);
      console.log(`   ID: ${colors.cyan}${product.id}${colors.reset}`);
      console.log(`   Description: ${product.description || 'No description'}`);
      console.log(`   Active: ${product.active ? colors.green + 'Yes' + colors.reset : colors.red + 'No' + colors.reset}`);
      console.log(`   Created: ${new Date(product.created * 1000).toLocaleDateString()}`);
      console.log('   ' + '-'.repeat(70));
    });
    console.log('='.repeat(80) + '\n');
  } catch (error) {
    log.error(`Failed to list products: ${error.message}`);
  }
}

// List all prices
async function listPrices() {
  try {
    log.header('Stripe Prices');
    const prices = await stripe.prices.list({ limit: 50 });
    
    if (prices.data.length === 0) {
      log.info('No prices found');
      return;
    }
    
    console.log('\n' + '='.repeat(100));
    for (const price of prices.data) {
      const product = await stripe.products.retrieve(price.product);
      
      console.log(`${colors.bright}${product.name}${colors.reset}`);
      console.log(`   Price ID: ${colors.cyan}${price.id}${colors.reset}`);
      console.log(`   Product ID: ${colors.magenta}${price.product}${colors.reset}`);
      console.log(`   Amount: ${colors.green}${(price.unit_amount / 100).toFixed(2)} ${price.currency.toUpperCase()}${colors.reset}`);
      console.log(`   Interval: ${price.recurring ? colors.yellow + price.recurring.interval + colors.reset : 'One-time'}`);
      console.log(`   Active: ${price.active ? colors.green + 'Yes' + colors.reset : colors.red + 'No' + colors.reset}`);
      console.log('   ' + '-'.repeat(90));
    }
    console.log('='.repeat(100) + '\n');
  } catch (error) {
    log.error(`Failed to list prices: ${error.message}`);
  }
}

// Create a new product
async function createProduct(name, description) {
  try {
    log.info(`Creating product: ${name}`);
    
    const product = await stripe.products.create({
      name: name,
      description: description,
      type: 'service',
    });
    
    log.success(`Product created successfully!`);
    console.log(`   ID: ${colors.cyan}${product.id}${colors.reset}`);
    console.log(`   Name: ${colors.bright}${product.name}${colors.reset}`);
    console.log(`   Description: ${product.description}`);
  } catch (error) {
    log.error(`Failed to create product: ${error.message}`);
  }
}

// Create a new price
async function createPrice(productId, amount, currency = 'gbp', interval = 'month') {
  try {
    log.info(`Creating price for product: ${productId}`);
    
    const priceData = {
      product: productId,
      unit_amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
    };
    
    if (interval !== 'one_time') {
      priceData.recurring = { interval: interval };
    }
    
    const price = await stripe.prices.create(priceData);
    
    log.success(`Price created successfully!`);
    console.log(`   Price ID: ${colors.cyan}${price.id}${colors.reset}`);
    console.log(`   Amount: ${colors.green}${(price.unit_amount / 100).toFixed(2)} ${price.currency.toUpperCase()}${colors.reset}`);
    console.log(`   Interval: ${price.recurring ? colors.yellow + price.recurring.interval + colors.reset : 'One-time'}`);
    
    // Show environment variable format
    log.info('Add this to your .env.local:');
    const envName = `STRIPE_${productId.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_${interval.toUpperCase()}_PRICE_ID`;
    console.log(`   ${colors.magenta}${envName}=${price.id}${colors.reset}`);
  } catch (error) {
    log.error(`Failed to create price: ${error.message}`);
  }
}

// List webhook endpoints
async function listWebhooks() {
  try {
    log.header('Stripe Webhook Endpoints');
    const endpoints = await stripe.webhookEndpoints.list();
    
    if (endpoints.data.length === 0) {
      log.info('No webhook endpoints found');
      return;
    }
    
    console.log('\n' + '='.repeat(100));
    endpoints.data.forEach((endpoint, index) => {
      console.log(`${index + 1}. ${colors.bright}${endpoint.url}${colors.reset}`);
      console.log(`   ID: ${colors.cyan}${endpoint.id}${colors.reset}`);
      console.log(`   Status: ${endpoint.status === 'enabled' ? colors.green + 'Enabled' + colors.reset : colors.red + 'Disabled' + colors.reset}`);
      console.log(`   Events: ${endpoint.enabled_events.join(', ')}`);
      console.log(`   Created: ${new Date(endpoint.created * 1000).toLocaleDateString()}`);
      console.log('   ' + '-'.repeat(90));
    });
    console.log('='.repeat(100) + '\n');
  } catch (error) {
    log.error(`Failed to list webhooks: ${error.message}`);
  }
}

// Start webhook listener
function startWebhookListener() {
  log.header('Starting Stripe Webhook Listener');
  log.info('This will forward webhooks to http://localhost:3001/api/webhooks/stripe');
  log.warning('Make sure your Next.js app is running on port 3001');
  
  const webhookProcess = spawn('stripe', [
    'listen',
    '--forward-to',
    'localhost:3001/api/webhooks/stripe'
  ], { stdio: 'inherit' });
  
  webhookProcess.on('error', (error) => {
    if (error.code === 'ENOENT') {
      log.error('Stripe CLI not found. Please install it first:');
      log.info('https://stripe.com/docs/stripe-cli#install');
      log.info('Or use: brew install stripe/stripe-cli/stripe');
    } else {
      log.error(`Webhook listener error: ${error.message}`);
    }
  });
  
  webhookProcess.on('close', (code) => {
    log.info(`Webhook listener stopped with code ${code}`);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log.info('Stopping webhook listener...');
    webhookProcess.kill('SIGINT');
  });
}

// List customers
async function listCustomers() {
  try {
    log.header('Stripe Customers');
    const customers = await stripe.customers.list({ limit: 20 });
    
    if (customers.data.length === 0) {
      log.info('No customers found');
      return;
    }
    
    console.log('\n' + '='.repeat(100));
    customers.data.forEach((customer, index) => {
      console.log(`${index + 1}. ${colors.bright}${customer.name || customer.email || 'Unnamed'}${colors.reset}`);
      console.log(`   ID: ${colors.cyan}${customer.id}${colors.reset}`);
      console.log(`   Email: ${customer.email || 'No email'}`);
      console.log(`   Created: ${new Date(customer.created * 1000).toLocaleDateString()}`);
      console.log(`   Delinquent: ${customer.delinquent ? colors.red + 'Yes' + colors.reset : colors.green + 'No' + colors.reset}`);
      console.log('   ' + '-'.repeat(90));
    });
    console.log('='.repeat(100) + '\n');
  } catch (error) {
    log.error(`Failed to list customers: ${error.message}`);
  }
}

// List subscriptions
async function listSubscriptions() {
  try {
    log.header('Stripe Subscriptions');
    const subscriptions = await stripe.subscriptions.list({ limit: 20 });
    
    if (subscriptions.data.length === 0) {
      log.info('No subscriptions found');
      return;
    }
    
    console.log('\n' + '='.repeat(100));
    for (const subscription of subscriptions.data) {
      const customer = await stripe.customers.retrieve(subscription.customer);
      
      console.log(`${colors.bright}${customer.name || customer.email || 'Unnamed Customer'}${colors.reset}`);
      console.log(`   Subscription ID: ${colors.cyan}${subscription.id}${colors.reset}`);
      console.log(`   Customer ID: ${colors.magenta}${subscription.customer}${colors.reset}`);
      console.log(`   Status: ${getStatusColor(subscription.status)}${subscription.status}${colors.reset}`);
      console.log(`   Current Period: ${new Date(subscription.current_period_start * 1000).toLocaleDateString()} - ${new Date(subscription.current_period_end * 1000).toLocaleDateString()}`);
      
      if (subscription.items.data.length > 0) {
        console.log(`   Items:`);
        for (const item of subscription.items.data) {
          const price = await stripe.prices.retrieve(item.price.id);
          const product = await stripe.products.retrieve(price.product);
          console.log(`     - ${product.name}: ${(price.unit_amount / 100).toFixed(2)} ${price.currency.toUpperCase()}/${price.recurring?.interval}`);
        }
      }
      console.log('   ' + '-'.repeat(90));
    }
    console.log('='.repeat(100) + '\n');
  } catch (error) {
    log.error(`Failed to list subscriptions: ${error.message}`);
  }
}

// Helper function to get status color
function getStatusColor(status) {
  switch (status) {
    case 'active': return colors.green;
    case 'trialing': return colors.blue;
    case 'past_due': return colors.yellow;
    case 'canceled':
    case 'unpaid': return colors.red;
    default: return colors.reset;
  }
}

// Test webhook endpoint
async function testWebhook() {
  try {
    log.header('Testing Webhook Endpoint');
    
    // Create a test customer to trigger webhook
    const customer = await stripe.customers.create({
      email: 'test@audiostems.com',
      name: 'Test Customer',
      metadata: {
        test: 'true',
        created_by: 'stripe-cli'
      }
    });
    
    log.success(`Test customer created: ${customer.id}`);
    log.info('This should trigger a customer.created webhook event');
    
    // Clean up test customer after 5 seconds
    setTimeout(async () => {
      try {
        await stripe.customers.del(customer.id);
        log.success('Test customer cleaned up');
      } catch (error) {
        log.warning('Failed to clean up test customer');
      }
    }, 5000);
    
  } catch (error) {
    log.error(`Failed to test webhook: ${error.message}`);
  }
}

// Show help
function showHelp() {
  console.log(`
${colors.cyan}${colors.bright}AudioStems Stripe CLI Tool${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node scripts/stripe-cli.js <command> [options]

${colors.yellow}Commands:${colors.reset}
  ${colors.green}products${colors.reset}                                    List all products
  ${colors.green}prices${colors.reset}                                      List all prices  
  ${colors.green}create-product${colors.reset} <name> <description>         Create a new product
  ${colors.green}create-price${colors.reset} <product_id> <amount> [currency] [interval]  Create a new price
  ${colors.green}webhooks${colors.reset}                                    List all webhook endpoints
  ${colors.green}listen${colors.reset}                                      Start webhook listener for local development
  ${colors.green}test-webhook${colors.reset}                               Test webhook endpoint  
  ${colors.green}customers${colors.reset}                                   List customers
  ${colors.green}subscriptions${colors.reset}                              List subscriptions
  ${colors.green}help${colors.reset}                                        Show this help message

${colors.yellow}Examples:${colors.reset}
  node scripts/stripe-cli.js products
  node scripts/stripe-cli.js create-product "Artist Pro" "Professional plan for artists"
  node scripts/stripe-cli.js create-price prod_ABC123 49.99 gbp month
  node scripts/stripe-cli.js listen

${colors.yellow}Environment:${colors.reset}
  Make sure your .env.local file contains:
  - STRIPE_SECRET_KEY
  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  `);
}

// Main execution
async function main() {
  const command = process.argv[2];
  
  if (!command || command === 'help') {
    showHelp();
    return;
  }
  
  validateStripeConfig();
  
  switch (command) {
    case 'products':
      await listProducts();
      break;
      
    case 'prices':
      await listPrices();
      break;
      
    case 'create-product':
      const name = process.argv[3];
      const description = process.argv[4];
      if (!name || !description) {
        log.error('Usage: create-product <name> <description>');
        return;
      }
      await createProduct(name, description);
      break;
      
    case 'create-price':
      const productId = process.argv[3];
      const amount = parseFloat(process.argv[4]);
      const currency = process.argv[5] || 'gbp';
      const interval = process.argv[6] || 'month';
      
      if (!productId || isNaN(amount)) {
        log.error('Usage: create-price <product_id> <amount> [currency] [interval]');
        return;
      }
      await createPrice(productId, amount, currency, interval);
      break;
      
    case 'webhooks':
      await listWebhooks();
      break;
      
    case 'listen':
      startWebhookListener();
      break;
      
    case 'test-webhook':
      await testWebhook();
      break;
      
    case 'customers':
      await listCustomers();
      break;
      
    case 'subscriptions':
      await listSubscriptions();
      break;
      
    default:
      log.error(`Unknown command: ${command}`);
      log.info('Run "node scripts/stripe-cli.js help" for available commands');
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});

// Run the CLI
main().catch((error) => {
  log.error(`CLI error: ${error.message}`);
  process.exit(1);
});