"use client"
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import Image from 'next/image'
import { 
  Package, 
  Layers, 
  Tag, 
  Star, 
  TrendingUp, 
  ShoppingCart,
  Heart,
  Eye,
  Edit,
  Calendar,
  Hash,
  Palette,
  Ruler,
  Box,
  Weight,
  CheckCircle,
  XCircle,
  Sparkles
} from 'lucide-react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import { useProduct } from '@/hooks/products/useProduct'
import { useMessages } from '@/context/useMessage'

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const productId = String(params.id)
  const [selectedImage, setSelectedImage] = useState(0)
 
  useEffect(() => {
    if (!productId || productId === 'undefined') {
      router.push('/dashboard/products')
    }
  }, [productId, router])
 
  const { setMessage } = useMessages()

  const {
    data: product,
    isLoading,
    status,
  } = useProduct(productId)

  useEffect(() => {
    if (status === 'error') {
      setMessage('Product not found', 'error')
      router.push('/dashboard/products')
    }
  }, [status, router, setMessage])

  const SkeletonLoader = () => (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <div className="h-96 bg-gray-300 rounded-2xl"></div>
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-10 bg-gray-300 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )

  const InfoRow = ({ icon: Icon, label, value, badge }: any) => (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3">
        <Icon size={16} className="text-brand-500" />
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-semibold text-gray-900">{value}</span>
        {badge && badge}
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <PageHeader
            breadcrumb={["Products", "Product details"]}
            title="Product management"
          />
          <SkeletonLoader />
        </div>
      </DashboardLayout>
    )
  }

  if (!product) return null

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          breadcrumb={["Products", product.name]}
          title="Product Details"
        />

        {/* Hero Section with Images */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden aspect-square border-2 border-gray-200 shadow-xl group">
              {product.images && product.images.length > 0 ? (
                <>
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.featured && (
                    <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
                      <Star size={12} fill="currentColor" />
                      <span>Featured</span>
                    </div>
                  )}
                  {product.isNewIn && (
                    <div className="absolute top-4 left-4 bg-brand-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
                      <Sparkles size={12} />
                      <span>New In</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package size={64} className="text-gray-300" />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                      selectedImage === idx 
                        ? 'border-brand-500 shadow-lg' 
                        : 'border-gray-200 hover:border-brand-300'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                  <p className="text-brand-100 text-sm flex items-center space-x-2">
                    <Hash size={14} />
                    <span>SKU: {product.sku}</span>
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/products/${productId}/edit-product`)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
              </div>

              <div className="flex items-baseline space-x-3">
                <span className="text-4xl font-black">${product.price.toFixed(2)}</span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-xl text-brand-200 line-through">
                    ${product.comparePrice.toFixed(2)}
                  </span>
                )}
              </div>

              {product.comparePrice && product.comparePrice > product.price && (
                <div className="mt-2 inline-block bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                  Save {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={ShoppingCart}
                label="Total Orders"
                value={product.stats?.totalOrders ?? 0}
                color="bg-gradient-to-br from-green-500 to-green-600"
              />
              <StatCard
                icon={Heart}
                label="Favorites"
                value={product.stats?.totalFavorites ?? 0}
                color="bg-gradient-to-br from-pink-500 to-pink-600"
              />
              <StatCard
                icon={Star}
                label="Avg Rating"
                value={product.stats?.avgRating ? product.stats.avgRating.toFixed(1) : 'N/A'}
                color="bg-gradient-to-br from-yellow-500 to-yellow-600"
              />
              <StatCard
                icon={Eye}
                label="Reviews"
                value={product.stats?.totalReviews ?? 0}
                color="bg-gradient-to-br from-blue-500 to-blue-600"
              />
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Availability</span>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-bold ${
                  product.available 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {product.available ? (
                    <>
                      <CheckCircle size={14} />
                      <span>Available</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={14} />
                      <span>Unavailable</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Package size={20} className="text-brand-500" />
                <span>Description</span>
              </h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
              {product.shortDescription && (
                <p className="text-sm text-gray-500 mt-3 italic">{product.shortDescription}</p>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Layers size={20} className="text-brand-500" />
                  <span>Product Variants ({product.variants.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.variants.map((variant, idx) => (
                    <div
                      key={variant.id}
                      className="border-2 border-gray-100 rounded-xl p-4 hover:border-brand-300 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-brand-500 uppercase tracking-wide">
                          Variant {idx + 1}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          variant.stock > 0 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {variant.stock} in stock
                        </span>
                      </div>
                      <div className="space-y-2">
                        {variant.size && (
                          <div className="flex items-center space-x-2">
                            <Ruler size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-600">Size:</span>
                            <span className="text-sm font-semibold">{variant.size}</span>
                          </div>
                        )}
                        {variant.color && (
                          <div className="flex items-center space-x-2">
                            <Palette size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-600">Color:</span>
                            <div className="flex items-center space-x-2">
                              {variant.colorHex && (
                                <div
                                  className="w-4 h-4 rounded-full border-2 border-gray-300"
                                  style={{ backgroundColor: variant.colorHex }}
                                />
                              )}
                              <span className="text-sm font-semibold">{variant.color}</span>
                            </div>
                          </div>
                        )}
                        {variant.material && (
                          <div className="flex items-center space-x-2">
                            <Box size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-600">Material:</span>
                            <span className="text-sm font-semibold">{variant.material}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                          <Hash size={14} className="text-gray-400" />
                          <span className="text-xs text-gray-500">{variant.sku}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Product Details */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Product Details</h3>
              <div className="space-y-1">
                <InfoRow
                  icon={Tag}
                  label="Category"
                  value={product.category?.name ?? 'N/A'}
                />
                {product.brand && (
                  <InfoRow
                    icon={TrendingUp}
                    label="Brand"
                    value={product.brand.name}
                  />
                )}
                <InfoRow
                  icon={Package}
                  label="Total Stock"
                  value={product.stats?.totalStock ?? product.stock ?? 0}
                  badge={
                    (product.stats?.totalStock ?? product.stock ?? 0) > 0 ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                        Out of Stock
                      </span>
                    )
                  }
                />
                {product.weight && (
                  <InfoRow
                    icon={Weight}
                    label="Weight"
                    value={`${product.weight} kg`}
                  />
                )}
                <InfoRow
                  icon={Calendar}
                  label="Created"
                  value={format(new Date(product.createdAt), 'MMM dd, yyyy')}
                />
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-medium border border-brand-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        {/* <CommentSection resourceType="product" resourceId={productId} /> */}
      </div>
    </DashboardLayout>
  )
}