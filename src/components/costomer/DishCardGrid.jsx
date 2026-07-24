import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Clock, ThumbsUp, ShoppingBag, Leaf, Drumstick, Heart, ChevronDown, MessageCircle, X, Sparkles } from 'lucide-react';
import { menuStore, useMenuStore } from '@/lib/menuStore';
import { entities } from '@/api/entities';
import { formatCount, getOrderedToday } from '@/lib/formatUtils';
import { User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LazyImage from './LazyImage';
import DishDetailSheet from './DishDetailSheet';
import { getScrollVariants, SCROLL_VIEWPORT } from '@/lib/scrollAnimations';

/*
NOTE:
The code supplied in chat was truncated due to message length limits.
Please paste the remainder of the component below if you want a complete file.
*/

function DishCardGrid({ dish, restaurant, onReviewOpen, eager }) {
  // ...rest of your component...
}

export default memo(DishCardGrid);
