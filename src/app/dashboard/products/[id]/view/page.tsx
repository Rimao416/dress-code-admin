"use client"
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
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
import { useTheme } from '@/context/ThemeContext'

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { isDarkMode } = useTheme()
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
      setMessage('Produit non trouvé', 'error')
      router.push('/dashboard/products')
    }
  }, [status, router, setMessage])

  const SkeletonLoader = () => (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <div className={`h-96 rounded-2xl ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`h-20 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className={`h-10 rounded w-3/4 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
          <div className={`h-6 rounded w-1/2 ${isDarkMode ? 'bg-slate-600' : 'bg-gray-200'}`}></div>
          <div className={`h-32 rounded ${isDarkMode ? 'bg-slate-600' : 'bg-gray-200'}`}></div>
        </div>
      </div>
    </div>
  )

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className={`rounded-xl p-4 border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
      isDarkMode 
        ? 'bg-slate-800/50 border-slate-700' 
        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        <div>
          <p className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            {label}
          </p>
          <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  )

  const InfoRow = ({ icon: Icon, label, value, badge }: any) => (
    <div className={`flex items-center justify-between py-3 px-4 rounded-lg transition-colors ${
      isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'
    }`}>
      <div className="flex items-center space-x-3">
        <Icon size={16} className="text-blue-500" />
        <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
          {label}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {value}
        </span>
        {badge && badge}
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <PageHeader
            breadcrumb={["Produits", "Détails du produit"]}
            title="Gestion des produits"
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
          breadcrumb={["Produits", product.name]}
          title="Détails du produit"
        />

        {/* Section Héros avec Images */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Galerie d'images */}
          <div className="space-y-4">
            <div className={`relative rounded-2xl overflow-hidden aspect-square border-2 shadow-xl group ${
              isDarkMode 
                ? 'bg-slate-700 border-slate-600' 
                : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
            }`}>
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
                      <span>Vedette</span>
                    </div>
                  )}
                  {product.isNewIn && (
                    <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
                      <Sparkles size={12} />
                      <span>Nouveau</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package size={64} className={isDarkMode ? 'text-slate-500' : 'text-gray-300'} />
                </div>
              )}
            </div>

            {/* Miniatures */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                      selectedImage === idx 
                        ? `border-blue-500 shadow-lg ${isDarkMode ? 'ring-2 ring-blue-500/20' : ''}` 
                        : `${isDarkMode ? 'border-slate-600 hover:border-blue-400' : 'border-gray-200 hover:border-blue-300'}`
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

          {/* Infos Produit */}
          <div className="space-y-6">
            {/* En-tête */}
            <div className={`rounded-2xl p-6 shadow-xl ${
              isDarkMode 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                  <p className="text-blue-100 text-sm flex items-center space-x-2">
                    <Hash size={14} />
                    <span>SKU: {product.sku}</span>
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/products/${productId}/edit`)}
                  className={`backdrop-blur-sm border text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl ${
                    isDarkMode 
                      ? 'bg-white/10 hover:bg-white/20 border-white/30' 
                      : 'bg-white/20 hover:bg-white/30 border-white/30'
                  }`}
                >
                  <Edit size={16} />
                  <span>Modifier</span>
                </button>
              </div>

              <div className="flex items-baseline space-x-3">
                <span className="text-4xl font-black">{product.price.toFixed(2)} €</span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-xl text-blue-200 line-through">
                    {product.comparePrice.toFixed(2)} €
                  </span>
                )}
              </div>

              {product.comparePrice && product.comparePrice > product.price && (
                <div className="mt-2 inline-block bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                  Économisez {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                </div>
              )}
            </div>

            {/* Stats Rapides */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={ShoppingCart}
                label="Commandes"
                value={product.stats?.totalOrders ?? 0}
                color="bg-gradient-to-br from-green-500 to-green-600"
              />
              <StatCard
                icon={Heart}
                label="Favoris"
                value={product.stats?.totalFavorites ?? 0}
                color="bg-gradient-to-br from-pink-500 to-pink-600"
              />
              <StatCard
                icon={Star}
                label="Note moy."
                value={product.stats?.avgRating ? product.stats.avgRating.toFixed(1) : 'N/A'}
                color="bg-gradient-to-br from-yellow-500 to-yellow-600"
              />
              <StatCard
                icon={Eye}
                label="Avis"
                value={product.stats?.totalReviews ?? 0}
                color="bg-gradient-to-br from-blue-500 to-blue-600"
              />
            </div>

            {/* Statut */}
            <div className={`rounded-xl p-4 border shadow-sm ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  Disponibilité
                </span>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-bold ${
                  product.available 
                    ? `${isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}` 
                    : `${isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'}`
                }`}>
                  {product.available ? (
                    <>
                      <CheckCircle size={14} />
                      <span>Disponible</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={14} />
                      <span>Non disponible</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informations Détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Infos Principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className={`rounded-2xl p-6 border shadow-sm ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-700' 
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center space-x-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Package size={20} className="text-blue-500" />
                <span>Description</span>
              </h3>
              <p className={`leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                {product.description}
              </p>
              {product.shortDescription && (
                <p className={`text-sm mt-3 italic ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  {product.shortDescription}
                </p>
              )}
            </div>

            {/* Variantes */}
            {product.variants && product.variants.length > 0 && (
              <div className={`rounded-2xl p-6 border shadow-sm ${
                isDarkMode 
                  ? 'bg-slate-800/50 border-slate-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center space-x-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <Layers size={20} className="text-blue-500" />
                  <span>Variantes du produit ({product.variants.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.variants.map((variant, idx) => (
                    <div
                      key={variant.id}
                      className={`border-2 rounded-xl p-4 transition-all duration-300 ${
                        isDarkMode 
                          ? 'border-slate-600 hover:border-blue-500 hover:shadow-md hover:bg-slate-700/30' 
                          : 'border-gray-100 hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-blue-500 uppercase tracking-wide">
                          Variante {idx + 1}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          variant.stock > 0 
                            ? `${isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}` 
                            : `${isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'}`
                        }`}>
                          {variant.stock} en stock
                        </span>
                      </div>
                      <div className="space-y-2">
                        {variant.size && (
                          <div className="flex items-center space-x-2">
                            <Ruler size={14} className={isDarkMode ? 'text-slate-500' : 'text-gray-400'} />
                            <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Taille:</span>
                            <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {variant.size}
                            </span>
                          </div>
                        )}
                        {variant.color && (
                          <div className="flex items-center space-x-2">
                            <Palette size={14} className={isDarkMode ? 'text-slate-500' : 'text-gray-400'} />
                            <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Couleur:</span>
                            <div className="flex items-center space-x-2">
                              {variant.colorHex && (
                                <div
                                  className={`w-4 h-4 rounded-full border-2 ${
                                    isDarkMode ? 'border-slate-400' : 'border-gray-300'
                                  }`}
                                  style={{ backgroundColor: variant.colorHex }}
                                />
                              )}
                              <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {variant.color}
                              </span>
                            </div>
                          </div>
                        )}
                        {variant.material && (
                          <div className="flex items-center space-x-2">
                            <Box size={14} className={isDarkMode ? 'text-slate-500' : 'text-gray-400'} />
                            <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Matière:</span>
                            <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {variant.material}
                            </span>
                          </div>
                        )}
                        <div className={`flex items-center space-x-2 pt-2 border-t ${
                          isDarkMode ? 'border-slate-600' : 'border-gray-100'
                        }`}>
                          <Hash size={14} className={isDarkMode ? 'text-slate-500' : 'text-gray-400'} />
                          <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                            {variant.sku}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Info Barre latérale */}
          <div className="space-y-6">
            {/* Détails du produit */}
            <div className={`rounded-2xl p-6 border shadow-sm ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-700' 
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Détails du produit
              </h3>
              <div className="space-y-1">
                <InfoRow
                  icon={Tag}
                  label="Catégorie"
                  value={product.category?.name ?? 'N/A'}
                />
                {product.brand && (
                  <InfoRow
                    icon={TrendingUp}
                    label="Marque"
                    value={product.brand.name}
                  />
                )}
                <InfoRow
                  icon={Package}
                  label="Stock total"
                  value={product.stats?.totalStock ?? product.stock ?? 0}
                  badge={
                    (product.stats?.totalStock ?? product.stock ?? 0) > 0 ? (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        isDarkMode 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        En stock
                      </span>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        isDarkMode 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        Rupture
                      </span>
                    )
                  }
                />
                {product.weight && (
                  <InfoRow
                    icon={Weight}
                    label="Poids"
                    value={`${product.weight} kg`}
                  />
                )}
                <InfoRow
                  icon={Calendar}
                  label="Créé le"
                  value={format(new Date(product.createdAt), 'd MMM yyyy', { locale: fr })}
                />
              </div>
            </div>

            {/* Étiquettes */}
            {product.tags && product.tags.length > 0 && (
              <div className={`rounded-2xl p-6 border shadow-sm ${
                isDarkMode 
                  ? 'bg-slate-800/50 border-slate-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Étiquettes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        isDarkMode 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}