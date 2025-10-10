import { PrismaClient, Role, Gender, OrderStatus, PaymentStatus, PaymentMethod, User, Client, Admin, Brand, Category, Product, Address } from '../src/generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Types pour les utilisateurs avec leurs relations
type UserWithClient = User & { client: Client };
type UserWithAdmin = User & { admin: Admin };

async function seedDatabase() {
  console.log('Starting database seeding...');
 
  // Nettoyer la base de données avant de commencer
  await cleanupDatabase();
 
  // Seed dans l'ordre des dépendances
  const { adminUsers, clientUsers } = await seedUsers();
  const brands = await seedBrands();
  const categories = await seedCategories();
  const products = await seedProducts(categories, brands);
  const addresses = await seedAddresses(clientUsers);
  await seedOrders(clientUsers, products, addresses);
  await seedReviews(clientUsers, products);
 
  console.log('Database seeding completed successfully!');
}

async function seedUsers(): Promise<{ adminUsers: UserWithAdmin[], clientUsers: UserWithClient[] }> {
  console.log('Seeding users...');
 
  const hashedPassword = await bcrypt.hash('password123', 10);
 
  // Créer des utilisateurs Admin
  const adminUsers: UserWithAdmin[] = [];
  for (let i = 0; i < 3; i++) {
    const adminUser = await prisma.user.create({
      data: {
        email: `admin${i}@example.com`,
        password: hashedPassword,
        role: Role.ADMIN,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        admin: {
          create: {
            permissions: ['READ_USERS', 'WRITE_USERS', 'READ_PRODUCTS', 'WRITE_PRODUCTS', 'READ_ORDERS', 'WRITE_ORDERS']
          }
        }
      },
      include: {
        admin: true
      }
    }) as UserWithAdmin;
    adminUsers.push(adminUser);
  }
 
  // Créer des utilisateurs Client
  const clientUsers: UserWithClient[] = [];
  const firstNames = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Lucas', 'Emma', 'Thomas', 'Camille', 'Nicolas', 'Léa'];
  const lastNames = ['Dupont', 'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Petit', 'Durand', 'Leroy', 'Moreau'];
 
  for (let i = 0; i < 15; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const gender = Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE;
   
    // Générer une date de naissance aléatoire (18-65 ans)
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - Math.floor(Math.random() * 47) - 18;
    const birthMonth = Math.floor(Math.random() * 12);
    const birthDay = Math.floor(Math.random() * 28) + 1;
    const dateOfBirth = new Date(birthYear, birthMonth, birthDay);
   
    const clientUser = await prisma.user.create({
      data: {
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        password: hashedPassword,
        role: Role.CLIENT,
        emailVerified: Math.random() > 0.2, // 80% ont vérifié leur email
        emailVerifiedAt: Math.random() > 0.2 ? new Date() : null,
        client: {
          create: {
            firstName: firstName,
            lastName: lastName,
            phone: `+33${Math.floor(Math.random() * 900000000) + 100000000}`,
            dateOfBirth: dateOfBirth,
            gender: gender,
            acceptedTerms: true,
            acceptedMarketing: Math.random() > 0.3,
            subscribedNewsletter: Math.random() > 0.4,
            subscribedAt: Math.random() > 0.4 ? new Date() : null,
            membershipPoints: Math.floor(Math.random() * 1000)
          }
        }
      },
      include: {
        client: true
      }
    }) as UserWithClient;
    clientUsers.push(clientUser);
  }
 
  console.log(`Seeded ${adminUsers.length} admin users`);
  console.log(`Seeded ${clientUsers.length} client users`);
 
  return { adminUsers, clientUsers };
}

async function seedBrands(): Promise<Brand[]> {
  console.log('Seeding brands...');
 
  const brandsData = [
    { name: 'Nike', description: 'Just Do It', website: 'https://nike.com' },
    { name: 'Adidas', description: 'Impossible is Nothing', website: 'https://adidas.com' },
    { name: 'Apple', description: 'Think Different', website: 'https://apple.com' },
    { name: 'Samsung', description: 'Do What You Can\'t', website: 'https://samsung.com' },
    { name: 'Sony', description: 'Be Moved', website: 'https://sony.com' },
    { name: 'Levi\'s', description: 'Quality never goes out of style', website: 'https://levis.com' },
    { name: 'Zara', description: 'Love Your Curves', website: 'https://zara.com' },
    { name: 'H&M', description: 'Fashion and quality at the best price', website: 'https://hm.com' },
  ];
  
  const brands: Brand[] = [];
  for (const brandData of brandsData) {
    const brand = await prisma.brand.create({
      data: {
        ...brandData,
        logo: `https://example.com/logos/${brandData.name.toLowerCase()}.png`
      }
    });
    brands.push(brand);
  }
  
  console.log(`Seeded ${brands.length} brands`);
  return brands;
}

async function seedCategories(): Promise<Category[]> {
  console.log('Seeding categories...');
 
  // Catégories principales
  const mainCategories = [
    { name: 'VÊTEMENTS', slug: 'vetements', description: 'Collection complète de vêtements' },
    { name: 'ACCESSOIRES', slug: 'accessoires', description: 'Accessoires mode et bijoux' }
  ];
  
  const categories: Category[] = [];
 
  for (let i = 0; i < mainCategories.length; i++) {
    const category = await prisma.category.create({
      data: {
        ...mainCategories[i],
        image: `https://example.com/categories/${mainCategories[i].slug}.jpg`,
        sortOrder: i
      }
    });
    categories.push(category);
  }
  
  // Sous-catégories pour VÊTEMENTS
  const vetementsSubCategories = [
    { name: 'Robe', slug: 'robe', parentName: 'VÊTEMENTS' },
    { name: 'Jupe', slug: 'jupe', parentName: 'VÊTEMENTS' },
    { name: 'Pull', slug: 'pull', parentName: 'VÊTEMENTS' },
    { name: 'Top', slug: 'top', parentName: 'VÊTEMENTS' },
    { name: 'Gilet', slug: 'gilet', parentName: 'VÊTEMENTS' },
    { name: 'Body', slug: 'body', parentName: 'VÊTEMENTS' },
    { name: 'Chemise', slug: 'chemise', parentName: 'VÊTEMENTS' },
    { name: 'Débardeur', slug: 'debardeur', parentName: 'VÊTEMENTS' },
    { name: 'Blazer', slug: 'blazer', parentName: 'VÊTEMENTS' },
    { name: 'Veste', slug: 'veste', parentName: 'VÊTEMENTS' },
    { name: 'Manteau', slug: 'manteau', parentName: 'VÊTEMENTS' },
    { name: 'Doudoune', slug: 'doudoune', parentName: 'VÊTEMENTS' },
    { name: 'Pantalon', slug: 'pantalon', parentName: 'VÊTEMENTS' },
    { name: 'Jean', slug: 'jean', parentName: 'VÊTEMENTS' },
    { name: 'Tailleur', slug: 'tailleur', parentName: 'VÊTEMENTS' },
    { name: 'Ensemble', slug: 'ensemble', parentName: 'VÊTEMENTS' },
    { name: 'Legging', slug: 'legging', parentName: 'VÊTEMENTS' },
    { name: 'Jogging', slug: 'jogging', parentName: 'VÊTEMENTS' },
    { name: 'TEE shirt', slug: 'tee-shirt', parentName: 'VÊTEMENTS' },
    { name: 'Short', slug: 'short', parentName: 'VÊTEMENTS' },
    { name: 'Parka', slug: 'parka', parentName: 'VÊTEMENTS' },
    { name: 'Abaya', slug: 'abaya', parentName: 'VÊTEMENTS' },
    { name: 'Kimono', slug: 'kimono', parentName: 'VÊTEMENTS' },
    { name: 'Caftan', slug: 'caftan', parentName: 'VÊTEMENTS' },
    { name: 'Djelabba', slug: 'djelabba', parentName: 'VÊTEMENTS' }
  ];
  
  // Sous-catégories pour ACCESSOIRES
  const accessoiresSubCategories = [
    { name: 'Sac à main', slug: 'sac-a-main', parentName: 'ACCESSOIRES' },
    { name: 'Châle', slug: 'chale', parentName: 'ACCESSOIRES' },
    { name: 'Ceinture', slug: 'ceinture', parentName: 'ACCESSOIRES' },
    { name: 'Lunettes solaires', slug: 'lunettes-soleil', parentName: 'ACCESSOIRES' },
    { name: 'Bijoux acier inoxydable', slug: 'bijoux-acier-inoxydable', parentName: 'ACCESSOIRES' }
  ];
  
  // Sous-sous-catégories pour Bijoux acier inoxydable
  const bijouxSubCategories = [
    { name: 'Collier', slug: 'collier', parentName: 'Bijoux acier inoxydable' },
    { name: 'Bague', slug: 'bague', parentName: 'Bijoux acier inoxydable' },
    { name: 'Bracelet', slug: 'bracelet', parentName: 'Bijoux acier inoxydable' },
    { name: 'Gourmette', slug: 'gourmette', parentName: 'Bijoux acier inoxydable' },
    { name: 'Boucle d\'oreilles', slug: 'boucle-oreilles', parentName: 'Bijoux acier inoxydable' },
    { name: 'Coffret montre', slug: 'coffret-montre', parentName: 'Bijoux acier inoxydable' },
    { name: 'Broche', slug: 'broche', parentName: 'Bijoux acier inoxydable' },
    { name: 'Raz de cou', slug: 'raz-de-cou', parentName: 'Bijoux acier inoxydable' }
  ];
  
  // Créer les sous-catégories pour VÊTEMENTS
  for (const subCat of vetementsSubCategories) {
    const parent = categories.find((cat: Category) => cat.name === subCat.parentName);
    if (parent) {
      const subCategory = await prisma.category.create({
        data: {
          name: subCat.name,
          slug: subCat.slug,
          parentId: parent.id,
          image: `https://example.com/categories/${subCat.slug}.jpg`,
          sortOrder: vetementsSubCategories.indexOf(subCat)
        }
      });
      categories.push(subCategory);
    }
  }
  
  // Créer les sous-catégories pour ACCESSOIRES
  for (const subCat of accessoiresSubCategories) {
    const parent = categories.find((cat: Category) => cat.name === subCat.parentName);
    if (parent) {
      const subCategory = await prisma.category.create({
        data: {
          name: subCat.name,
          slug: subCat.slug,
          parentId: parent.id,
          image: `https://example.com/categories/${subCat.slug}.jpg`,
          sortOrder: accessoiresSubCategories.indexOf(subCat)
        }
      });
      categories.push(subCategory);
    }
  }
  
  // Créer les sous-sous-catégories pour Bijoux
  const bijouxParent = categories.find((cat: Category) => cat.name === 'Bijoux acier inoxydable');
  if (bijouxParent) {
    for (const subCat of bijouxSubCategories) {
      const subSubCategory = await prisma.category.create({
        data: {
          name: subCat.name,
          slug: subCat.slug,
          parentId: bijouxParent.id,
          image: `https://example.com/categories/${subCat.slug}.jpg`,
          sortOrder: bijouxSubCategories.indexOf(subCat)
        }
      });
      categories.push(subSubCategory);
    }
  }
  
  console.log(`Seeded ${categories.length} categories`);
  return categories;
}

async function seedProducts(categories: Category[], brands: Brand[]): Promise<Product[]> {
  console.log('Seeding products...');
 
  const productsData = [
    {
      name: 'Robe longue élégante',
      description: 'Robe longue en tissu fluide pour occasions spéciales',
      shortDescription: 'Robe longue élégante',
      price: 89.99,
      comparePrice: 119.99,
      categoryName: 'Robe',
      brandName: 'Zara',
      tags: ['robe', 'longue', 'élégant', 'soirée'],
      featured: true,
      isNewIn: true
    },
    {
      name: 'Jean slim délavé',
      description: 'Jean slim en denim délavé, coupe moderne',
      shortDescription: 'Jean slim délavé',
      price: 69.99,
      comparePrice: 89.99,
      categoryName: 'Jean',
      brandName: 'Levi\'s',
      tags: ['jean', 'slim', 'délavé', 'casual'],
      featured: true
    },
    {
      name: 'Pull en cachemire',
      description: 'Pull décontracté en cachemire pour un confort optimal',
      shortDescription: 'Pull cachemire confortable',
      price: 129.99,
      categoryName: 'Pull',
      brandName: 'H&M',
      tags: ['pull', 'cachemire', 'confort', 'hiver'],
      featured: true
    },
    {
      name: 'Sac à main cuir',
      description: 'Sac à main en cuir véritable, design intemporel',
      shortDescription: 'Sac main cuir véritable',
      price: 199.99,
      comparePrice: 249.99,
      categoryName: 'Sac à main',
      brandName: 'Nike',
      tags: ['sac', 'cuir', 'luxe', 'accessoire'],
      featured: true,
      isNewIn: true
    },
    {
      name: 'Collier acier inoxydable',
      description: 'Collier élégant en acier inoxydable, résistant à l\'eau',
      shortDescription: 'Collier acier inoxydable',
      price: 49.99,
      categoryName: 'Collier',
      brandName: 'Sony',
      tags: ['collier', 'acier', 'bijoux', 'élégant']
    },
    {
      name: 'TEE shirt basique',
      description: 'TEE shirt en coton bio, coupe regular fit',
      shortDescription: 'TEE shirt coton bio',
      price: 24.99,
      categoryName: 'TEE shirt',
      brandName: 'H&M',
      tags: ['tee-shirt', 'coton', 'basique', 'casual'],
      isNewIn: true
    },
    {
      name: 'Abaya brodée',
      description: 'Abaya traditionnelle avec broderies délicates',
      shortDescription: 'Abaya brodée traditionnelle',
      price: 149.99,
      categoryName: 'Abaya',
      brandName: 'Zara',
      tags: ['abaya', 'traditionnel', 'broderie', 'élégant'],
      featured: true
    },
    {
      name: 'Lunettes solaires aviateur',
      description: 'Lunettes solaires style aviateur, protection UV400',
      shortDescription: 'Lunettes solaires aviateur',
      price: 79.99,
      categoryName: 'Lunettes solaires',
      brandName: 'Adidas',
      tags: ['lunettes', 'soleil', 'protection', 'style'],
      isNewIn: true
    }
  ];
  
  const products: Product[] = [];
 
  for (let i = 0; i < productsData.length; i++) {
    const productData = productsData[i];
    const category = categories.find((cat: Category) => cat.name === productData.categoryName);
    const brand = brands.find((b: Brand) => b.name === productData.brandName);
   
    if (category && brand) {
      const product = await prisma.product.create({
        data: {
          name: productData.name,
          description: productData.description,
          shortDescription: productData.shortDescription,
          price: productData.price,
          comparePrice: productData.comparePrice,
          images: [
            `https://example.com/products/product-${i}-1.jpg`,
            `https://example.com/products/product-${i}-2.jpg`,
            `https://example.com/products/product-${i}-3.jpg`
          ],
          categoryId: category.id,
          brandId: brand.id,
          sku: `SKU-${String(i + 1).padStart(4, '0')}`,
          stock: Math.floor(Math.random() * 100) + 10,
          tags: productData.tags,
          featured: productData.featured || false,
          isNewIn: productData.isNewIn || false,
          slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          metaTitle: productData.name,
          metaDescription: productData.shortDescription,
          weight: Math.random() * 2 + 0.1,
          dimensions: {
            length: Math.floor(Math.random() * 30) + 10,
            width: Math.floor(Math.random() * 20) + 5,
            height: Math.floor(Math.random() * 10) + 2
          }
        }
      });
     
      // Créer des variantes pour les vêtements
      if (['Robe longue élégante', 'Jean slim délavé', 'TEE shirt basique', 'Abaya brodée'].includes(productData.name)) {
        const sizes = ['S', 'M', 'L', 'XL'];
        const colors = [
          { name: 'Noir', hex: '#000000' },
          { name: 'Blanc', hex: '#FFFFFF' },
          { name: 'Bleu', hex: '#0066CC' },
          { name: 'Rouge', hex: '#CC0000' },
          { name: 'Beige', hex: '#F5F5DC' }
        ];
       
        for (const size of sizes) {
          for (const color of colors.slice(0, 3)) {
            await prisma.productVariant.create({
              data: {
                productId: product.id,
                size: size,
                color: color.name,
                colorHex: color.hex,
                sku: `${product.sku}-${size}-${color.name.substring(0, 3).toUpperCase()}`,
                stock: Math.floor(Math.random() * 20) + 5,
                images: [
                  `https://example.com/products/variants/${product.sku}-${size}-${color.name.toLowerCase()}.jpg`
                ]
              }
            });
          }
        }
      }
     
      products.push(product);
    }
  }
  
  console.log(`Seeded ${products.length} products`);
  return products;
}
async function seedAddresses(clientUsers: UserWithClient[]): Promise<Address[]> {
  console.log('Seeding addresses...');
 
  const addresses: Address[] = [];
  const cities = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'];
  const streets = ['Rue de la Paix', 'Avenue des Champs', 'Boulevard Saint-Germain', 'Place de la République', 'Rue du Commerce'];
 
  for (const clientUser of clientUsers) {
    // Créer 1-3 adresses par client
    const numAddresses = Math.floor(Math.random() * 3) + 1;
   
    for (let i = 0; i < numAddresses; i++) {
      const address = await prisma.address.create({
        data: {
          clientId: clientUser.client.id,
          firstName: clientUser.client.firstName,
          lastName: clientUser.client.lastName,
          company: Math.random() > 0.7 ? 'Ma Société SARL' : null,
          addressLine1: `${Math.floor(Math.random() * 999) + 1} ${streets[Math.floor(Math.random() * streets.length)]}`,
          addressLine2: Math.random() > 0.6 ? `Appartement ${Math.floor(Math.random() * 50) + 1}` : null,
          city: cities[Math.floor(Math.random() * cities.length)],
          postalCode: String(Math.floor(Math.random() * 90000) + 10000),
          country: 'France',
          phone: clientUser.client.phone,
          isDefault: i === 0 // La première adresse est par défaut
        }
      });
      addresses.push(address);
    }
  }
 
  console.log(`Seeded ${addresses.length} addresses`);
  return addresses;
}

async function seedCarts(clientUsers: UserWithClient[], products: Product[]): Promise<void> {
  console.log('Seeding carts...');
 
  // Créer des paniers pour certains clients
  for (let i = 0; i < Math.min(10, clientUsers.length); i++) {
    const clientUser = clientUsers[i];
   
    const cart = await prisma.cart.create({
      data: {
        clientId: clientUser.client.id
      }
    });
   
    // Ajouter des articles au panier
    const numItems = Math.floor(Math.random() * 5) + 1;
    for (let j = 0; j < numItems; j++) {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
     
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: randomProduct.id,
          quantity: Math.floor(Math.random() * 3) + 1,
          price: randomProduct.price
        }
      });
    }
  }
 
  console.log('Seeded carts');
}

async function seedOrders(clientUsers: UserWithClient[], products: Product[], addresses: Address[]): Promise<void> {
  console.log('Seeding orders...');
const statuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.REFUNDED];

  const paymentMethods = [PaymentMethod.CARD, PaymentMethod.PAYPAL, PaymentMethod.APPLE_PAY];
 
  for (let i = 0; i < 25; i++) {
    const randomClient = clientUsers[Math.floor(Math.random() * clientUsers.length)];
    const clientAddresses = addresses.filter((addr: Address) => addr.clientId === randomClient.client.id);
   
    if (clientAddresses.length > 0) {
      const shippingAddress = clientAddresses[Math.floor(Math.random() * clientAddresses.length)];
      const billingAddress = Math.random() > 0.5 ? shippingAddress : clientAddresses[Math.floor(Math.random() * clientAddresses.length)];
     
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentStatus = status === OrderStatus.DELIVERED ? PaymentStatus.COMPLETED :
                           status === OrderStatus.CANCELLED ? PaymentStatus.REFUNDED :
                           Math.random() > 0.3 ? PaymentStatus.COMPLETED : PaymentStatus.PENDING;
     
      let subtotal = 0;
      const numItems = Math.floor(Math.random() * 4) + 1;
     
      const order = await prisma.order.create({
        data: {
          orderNumber: `ORD-${String(i + 1).padStart(6, '0')}`,
          clientId: randomClient.client.id,
          status: status,
          subtotal: 0, // Sera mis à jour après
          shippingCost: Math.random() * 10 + 5,
          taxAmount: 0, // Sera calculé après
          discountAmount: Math.random() > 0.8 ? Math.random() * 20 : 0,
          totalAmount: 0, // Sera calculé après
          shippingAddressId: shippingAddress.id,
          billingAddressId: billingAddress.id,
          paymentStatus: paymentStatus,
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          notes: Math.random() > 0.8 ? 'Livraison rapide demandée' : null
        }
      });
     
      // Créer les items de commande
      for (let j = 0; j < numItems; j++) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const unitPrice = randomProduct.price;
        const totalPrice = unitPrice * quantity;
        subtotal += totalPrice;
       
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: randomProduct.id,
            quantity: quantity,
            unitPrice: unitPrice,
            totalPrice: totalPrice,
            productName: randomProduct.name,
            productSku: randomProduct.sku,
            variantInfo: Math.random() > 0.5 ? { size: 'M', color: 'Noir' } : undefined
          }
        });
      }
     
      // Mettre à jour les totaux de la commande
      const taxAmount = subtotal * 0.20; // TVA 20%
      const totalAmount = subtotal + order.shippingCost + taxAmount - order.discountAmount;
     
      await prisma.order.update({
        where: { id: order.id },
        data: {
          subtotal: subtotal,
          taxAmount: taxAmount,
          totalAmount: totalAmount
        }
      });
     
      // Ajouter du tracking pour les commandes expédiées/livrées
      if (status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED) {
        await prisma.orderTracking.create({
          data: {
            orderId: order.id,
            status: 'SHIPPED',
            description: 'Colis expédié',
            location: 'Centre de tri Paris'
          }
        });
       
        if (status === OrderStatus.DELIVERED) {
          await prisma.orderTracking.create({
            data: {
              orderId: order.id,
              status: 'DELIVERED',
              description: 'Colis livré',
              location: 'Domicile client'
            }
          });
        }
      }
    }
  }
 
  console.log('Seeded orders');
}

async function seedReviews(clientUsers: UserWithClient[], products: Product[]): Promise<void> {
  console.log('Seeding reviews...');
 
  interface ReviewData {
    clientId: string;
    productId: string;
  }
  
  const reviews: ReviewData[] = [];
  const reviewTitles = [
    'Excellent produit !',
    'Très satisfait',
    'Conforme à mes attentes',
    'Qualité au rendez-vous',
    'Parfait pour moi',
    'Déçu de mon achat',
    'Moyen',
    'Super qualité'
  ];
 
  const reviewComments = [
    'Je recommande vivement ce produit, la qualité est excellente.',
    'Livraison rapide et produit conforme. Très content !',
    'Bon rapport qualité-prix, je recommande.',
    'Produit de bonne qualité, rien à redire.',
    'Exactement ce que je cherchais.',
    'La qualité n\'est pas au rendez-vous malheureusement.',
    'Correct sans plus.',
    'Excellent produit, je rachèterai certainement !'
  ];
 
  for (let i = 0; i < 50; i++) {
    const randomClient = clientUsers[Math.floor(Math.random() * clientUsers.length)];
    const randomProduct = products[Math.floor(Math.random() * products.length)];
   
    // Éviter les doublons (un client ne peut avoir qu'un avis par produit)
    const existingReview = reviews.find((r: ReviewData) => r.clientId === randomClient.client.id && r.productId === randomProduct.id);
    if (existingReview) continue;
   
    const rating = Math.floor(Math.random() * 5) + 1;
    const titleIndex = rating > 3 ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 3) + 5;
    const commentIndex = rating > 3 ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 3) + 5;
   
    try {
      await prisma.review.create({
        data: {
          clientId: randomClient.client.id,
          productId: randomProduct.id,
          rating: rating,
          title: reviewTitles[titleIndex],
          comment: reviewComments[commentIndex],
          images: Math.random() > 0.7 ? [`https://example.com/reviews/review-${i}-photo.jpg`] : [],
          verified: Math.random() > 0.3, // 70% d'achats vérifiés
          helpful: Math.floor(Math.random() * 10)
        }
      });
      
      reviews.push({
        clientId: randomClient.client.id,
        productId: randomProduct.id
      });
    } catch (error) {
      // Ignorer les erreurs de contrainte unique
      continue;
    }
  }
 
  console.log(`Seeded ${reviews.length} reviews`);
}



async function cleanupDatabase(): Promise<void> {
  console.log('Starting database cleanup...');
 
  try {
    // Supprimer dans l'ordre des dépendances pour éviter les erreurs de contraintes
    await prisma.orderTracking.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.wishlistItem.deleteMany({});
    await prisma.wishlist.deleteMany({});
    await prisma.favorite.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.brand.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.passwordResetToken.deleteMany({});
    await prisma.passwordResetAttempt.deleteMany({});
    await prisma.loginAttempt.deleteMany({});
    await prisma.twoFactorCode.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.admin.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.slider.deleteMany({});
    await prisma.newsletterSubscriber.deleteMany({});
    await prisma.coupon.deleteMany({});
   
    console.log('Database cleanup completed successfully!');
  } catch (error) {
    console.error('Error during database cleanup:', error);
    throw error;
  }
}

// Fonction principale pour exécuter le seed
async function main(): Promise<void> {
  try {
    await seedDatabase();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  main();
}

export {
  seedDatabase,
  seedUsers,
  seedBrands,
  seedCategories,
  seedProducts,
  seedAddresses,
  seedCarts,
  seedOrders,
  seedReviews,
  cleanupDatabase
};