import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Card,
  CardMedia,
  CardContent,
  Divider,
  Stack,
  Chip,
  Badge,
  TextField,
  Alert,
  Skeleton,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Security as SecurityIcon,
  LocalOffer as OfferIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart, cartUtils } from '../context/CartContext';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose }) => {
  const { 
    state: { items, totalItems, totalPrice, isOpen }, 
    removeItem, 
    updateQuantity,
    clearCart
  } = useCart();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const savings = cartUtils.calculateSavings(items);
  const freeShippingThreshold = 50;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - totalPrice);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: 420 },
          height: '100vh',
          borderRadius: { xs: 0, sm: '16px 0 0 16px' },
          border: 'none',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          maxWidth: '100vw',
          overflowX: 'hidden'
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Badge badgeContent={totalItems} color="secondary">
                <ShoppingCartIcon />
              </Badge>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Shopping Cart
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={onClose}
              sx={{ 
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Free Shipping Progress */}
          {remainingForFreeShipping > 0 && totalPrice > 0 && (
            <Box sx={{ mt: 2, p: 2, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Add ${remainingForFreeShipping.toFixed(2)} more for FREE shipping!
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    width: `${Math.min(100, (totalPrice / freeShippingThreshold) * 100)}%`,
                    height: '100%',
                    backgroundColor: 'white',
                    transition: 'width 0.3s ease'
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>

        {/* Cart Items */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {items.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}>
              <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3 }} />
              <Typography variant="h6" color="text.secondary">
                Your cart is empty
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add some products to get started
              </Typography>
              <Button 
                variant="contained" 
                onClick={onClose}
                sx={{ mt: 2 }}
              >
                Continue Shopping
              </Button>
            </Box>
          ) : (
            <Stack spacing={2}>
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Card sx={{ 
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }}>
                      <Box sx={{ p: 2 }}>
                        <Box display="flex" gap={2}>
                          <CardMedia
                            component="img"
                            sx={{ 
                              width: 80, 
                              height: 80, 
                              borderRadius: '8px',
                              objectFit: 'cover'
                            }}
                            image={item.product.image}
                            alt={item.product.name}
                          />
                          
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography 
                              variant="body1" 
                              fontWeight={600}
                              sx={{ 
                                fontSize: '14px',
                                mb: 0.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {item.product.name}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {item.product.brand}
                            </Typography>

                            {/* Variant info */}
                            {item.selectedVariant && (
                              <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
                                {item.selectedVariant.color && (
                                  <Chip 
                                    label={`Color: ${item.selectedVariant.color}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '10px', height: '18px' }}
                                  />
                                )}
                                {item.selectedVariant.size && (
                                  <Chip 
                                    label={`Size: ${item.selectedVariant.size}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '10px', height: '18px' }}
                                  />
                                )}
                              </Stack>
                            )}
                            
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Typography variant="h6" color="primary" fontWeight={700}>
                                ${(item.product.price * item.quantity).toFixed(2)}
                              </Typography>
                              
                              {/* Quantity Controls */}
                              <Box display="flex" alignItems="center" gap={1}>
                                <IconButton 
                                  size="small"
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  sx={{ 
                                    border: '1px solid rgba(0, 0, 0, 0.1)',
                                    width: 28,
                                    height: 28
                                  }}
                                >
                                  <RemoveIcon sx={{ fontSize: '14px' }} />
                                </IconButton>
                                
                                <Typography 
                                  variant="body2" 
                                  fontWeight={600}
                                  sx={{ minWidth: '20px', textAlign: 'center' }}
                                >
                                  {item.quantity}
                                </Typography>
                                
                                <IconButton 
                                  size="small"
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  sx={{ 
                                    border: '1px solid rgba(0, 0, 0, 0.1)',
                                    width: 28,
                                    height: 28
                                  }}
                                >
                                  <AddIcon sx={{ fontSize: '14px' }} />
                                </IconButton>
                                
                                <IconButton 
                                  size="small"
                                  onClick={() => removeItem(item.id)}
                                  color="error"
                                  sx={{ ml: 1 }}
                                >
                                  <DeleteIcon sx={{ fontSize: '16px' }} />
                                </IconButton>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Clear Cart Button */}
              {items.length > 0 && (
                <Button
                  variant="text"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={clearCart}
                  size="small"
                >
                  Clear Cart
                </Button>
              )}
            </Stack>
          )}
        </Box>

        {/* Footer - Checkout Section */}
        {items.length > 0 && (
          <Box sx={{ 
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            p: 3,
            backgroundColor: 'background.paper'
          }}>
            {/* Savings Alert */}
            {savings > 0 && (
              <Alert 
                severity="success" 
                sx={{ mb: 2, borderRadius: '8px' }}
                icon={<OfferIcon />}
              >
                You're saving ${savings.toFixed(2)} on this order!
              </Alert>
            )}

            {/* Order Summary */}
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {cartUtils.formatPrice(totalPrice)}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Shipping:</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {totalPrice >= freeShippingThreshold ? 'FREE' : '$5.99'}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6" fontWeight={700}>
                  Total:
                </Typography>
                <Typography variant="h6" color="primary" fontWeight={700}>
                  {cartUtils.formatPrice(
                    totalPrice + (totalPrice >= freeShippingThreshold ? 0 : 5.99)
                  )}
                </Typography>
              </Box>
            </Box>

            {/* Security Features */}
            <Stack direction="row" spacing={1} sx={{ mb: 3, justifyContent: 'center' }}>
              <Chip
                icon={<SecurityIcon />}
                label="Secure"
                size="small"
                variant="outlined"
                sx={{ fontSize: '10px' }}
              />
              <Chip
                icon={<ShippingIcon />}
                label="Fast Delivery"
                size="small"
                variant="outlined"
                sx={{ fontSize: '10px' }}
              />
              <Chip
                icon={<PaymentIcon />}
                label="Safe Payment"
                size="small"
                variant="outlined"
                sx={{ fontSize: '10px' }}
              />
            </Stack>

            {/* Checkout Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<PaymentIcon />}
              sx={{
                py: 1.5,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: '16px',
                fontWeight: 700,
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b5b95 100%)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
                }
              }}
            >
              Proceed to Checkout
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default CartDrawer;