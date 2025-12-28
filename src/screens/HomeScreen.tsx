import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth, useSalons, useLocation } from '../hooks';
import { serviceService, notificationService, locationService } from '../services';
import { Salon, ServiceCategory, ServiceMode, City, Area } from '../types';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';
import { SalonCard, SalonCardHorizontal, ShortsCarousel } from '../components';
import CategoryCarousel from '../components/CategoryCarousel';
import BannerCarousel from '../components/BannerCarousel';

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Indian cities data (major cities)
const INDIAN_CITIES: City[] = [
  { id: '1', name: 'Mumbai', slug: 'mumbai', state: 'Maharashtra', country: 'India' },
  { id: '2', name: 'Delhi', slug: 'delhi', state: 'Delhi', country: 'India' },
  { id: '3', name: 'Bangalore', slug: 'bangalore', state: 'Karnataka', country: 'India' },
  { id: '4', name: 'Hyderabad', slug: 'hyderabad', state: 'Telangana', country: 'India' },
  { id: '5', name: 'Chennai', slug: 'chennai', state: 'Tamil Nadu', country: 'India' },
  { id: '6', name: 'Kolkata', slug: 'kolkata', state: 'West Bengal', country: 'India' },
  { id: '7', name: 'Pune', slug: 'pune', state: 'Maharashtra', country: 'India' },
  { id: '8', name: 'Ahmedabad', slug: 'ahmedabad', state: 'Gujarat', country: 'India' },
  { id: '9', name: 'Jaipur', slug: 'jaipur', state: 'Rajasthan', country: 'India' },
  { id: '10', name: 'Surat', slug: 'surat', state: 'Gujarat', country: 'India' },
  { id: '11', name: 'Lucknow', slug: 'lucknow', state: 'Uttar Pradesh', country: 'India' },
  { id: '12', name: 'Kanpur', slug: 'kanpur', state: 'Uttar Pradesh', country: 'India' },
  { id: '13', name: 'Nagpur', slug: 'nagpur', state: 'Maharashtra', country: 'India' },
  { id: '14', name: 'Indore', slug: 'indore', state: 'Madhya Pradesh', country: 'India' },
  { id: '15', name: 'Thane', slug: 'thane', state: 'Maharashtra', country: 'India' },
  { id: '16', name: 'Bhopal', slug: 'bhopal', state: 'Madhya Pradesh', country: 'India' },
  { id: '17', name: 'Visakhapatnam', slug: 'visakhapatnam', state: 'Andhra Pradesh', country: 'India' },
  { id: '18', name: 'Patna', slug: 'patna', state: 'Bihar', country: 'India' },
  { id: '19', name: 'Vadodara', slug: 'vadodara', state: 'Gujarat', country: 'India' },
  { id: '20', name: 'Ghaziabad', slug: 'ghaziabad', state: 'Uttar Pradesh', country: 'India' },
  { id: '21', name: 'Ludhiana', slug: 'ludhiana', state: 'Punjab', country: 'India' },
  { id: '22', name: 'Agra', slug: 'agra', state: 'Uttar Pradesh', country: 'India' },
  { id: '23', name: 'Nashik', slug: 'nashik', state: 'Maharashtra', country: 'India' },
  { id: '24', name: 'Faridabad', slug: 'faridabad', state: 'Haryana', country: 'India' },
  { id: '25', name: 'Meerut', slug: 'meerut', state: 'Uttar Pradesh', country: 'India' },
  { id: '26', name: 'Rajkot', slug: 'rajkot', state: 'Gujarat', country: 'India' },
  { id: '27', name: 'Varanasi', slug: 'varanasi', state: 'Uttar Pradesh', country: 'India' },
  { id: '28', name: 'Srinagar', slug: 'srinagar', state: 'Jammu & Kashmir', country: 'India' },
  { id: '29', name: 'Aurangabad', slug: 'aurangabad', state: 'Maharashtra', country: 'India' },
  { id: '30', name: 'Dhanbad', slug: 'dhanbad', state: 'Jharkhand', country: 'India' },
  { id: '31', name: 'Amritsar', slug: 'amritsar', state: 'Punjab', country: 'India' },
  { id: '32', name: 'Navi Mumbai', slug: 'navi-mumbai', state: 'Maharashtra', country: 'India' },
  { id: '33', name: 'Allahabad', slug: 'allahabad', state: 'Uttar Pradesh', country: 'India' },
  { id: '34', name: 'Ranchi', slug: 'ranchi', state: 'Jharkhand', country: 'India' },
  { id: '35', name: 'Howrah', slug: 'howrah', state: 'West Bengal', country: 'India' },
  { id: '36', name: 'Coimbatore', slug: 'coimbatore', state: 'Tamil Nadu', country: 'India' },
  { id: '37', name: 'Jabalpur', slug: 'jabalpur', state: 'Madhya Pradesh', country: 'India' },
  { id: '38', name: 'Gwalior', slug: 'gwalior', state: 'Madhya Pradesh', country: 'India' },
  { id: '39', name: 'Vijayawada', slug: 'vijayawada', state: 'Andhra Pradesh', country: 'India' },
  { id: '40', name: 'Jodhpur', slug: 'jodhpur', state: 'Rajasthan', country: 'India' },
  { id: '41', name: 'Madurai', slug: 'madurai', state: 'Tamil Nadu', country: 'India' },
  { id: '42', name: 'Raipur', slug: 'raipur', state: 'Chhattisgarh', country: 'India' },
  { id: '43', name: 'Kota', slug: 'kota', state: 'Rajasthan', country: 'India' },
  { id: '44', name: 'Chandigarh', slug: 'chandigarh', state: 'Chandigarh', country: 'India' },
  { id: '45', name: 'Guwahati', slug: 'guwahati', state: 'Assam', country: 'India' },
  { id: '46', name: 'Solapur', slug: 'solapur', state: 'Maharashtra', country: 'India' },
  { id: '47', name: 'Hubli', slug: 'hubli', state: 'Karnataka', country: 'India' },
  { id: '48', name: 'Mysore', slug: 'mysore', state: 'Karnataka', country: 'India' },
  { id: '49', name: 'Tiruchirappalli', slug: 'tiruchirappalli', state: 'Tamil Nadu', country: 'India' },
  { id: '50', name: 'Bareilly', slug: 'bareilly', state: 'Uttar Pradesh', country: 'India' },
];

/**
 * HomeScreen - Amazon/Flipkart Inspired Design
 */
const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { 
    salons, 
    isLoading, 
    fetchSalons, 
    searchByLocation, 
    searchByMode 
  } = useSalons();
  const {
    location,
    hasPermission,
    requestPermission,
    refreshLocation,
  } = useLocation(true);
  
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ServiceMode | null>(null);
  const [nearbySalons, setNearbySalons] = useState<Salon[]>([]);
  const [trendingSalons, setTrendingSalons] = useState<Salon[]>([]);
  
  // Location picker state
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [manualLocation, setManualLocation] = useState<{ city: string; area?: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (location && selectedMode) {
      loadNearbySalons();
    }
  }, [location, selectedMode]);

  useEffect(() => {
    if (selectedMode) {
      loadSalonsByMode(selectedMode);
    } else {
      fetchSalons({ limit: 10 });
    }
  }, [selectedMode]);

  const loadData = async () => {
    await Promise.all([
      fetchSalons({ limit: 10 }),
      loadCategories(),
      loadUnreadCount(),
      loadTrendingSalons(),
    ]);
  };

  const loadCategories = async () => {
    try {
      const data = await serviceService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories', err);
      setCategories([
        { id: '1', name: 'Haircut', slug: 'haircut' },
        { id: '2', name: 'Beard', slug: 'beard' },
        { id: '3', name: 'Spa', slug: 'spa' },
        { id: '4', name: 'Facial', slug: 'facial' },
        { id: '5', name: 'Massage', slug: 'massage' },
        { id: '6', name: 'Makeup', slug: 'makeup' },
        { id: '7', name: 'Nails', slug: 'nails' },
        { id: '8', name: 'Waxing', slug: 'waxing' },
      ]);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const { count } = await notificationService.getUnreadNotifications();
      setUnreadCount(count);
    } catch (err) {}
  };

  const loadTrendingSalons = async () => {
    try {
      const result = await import('../services').then(m => 
        m.salonService.getSalons({ sortBy: 'popular', limit: 5 })
      );
      setTrendingSalons(result.data || []);
    } catch (err) {}
  };

  const loadSalonsByMode = async (mode: ServiceMode) => {
    if (location) {
      await searchByLocation(location.latitude, location.longitude, {
        mode,
        radius: 10000,
        limit: 10,
      });
    } else {
      await searchByMode(mode, { limit: 10 });
    }
  };

  const loadNearbySalons = async () => {
    if (!location) return;
    
    try {
      const result = await import('../services').then(m => 
        m.salonService.searchByLocation(
          location.latitude,
          location.longitude,
          {
            radius: 5000,
            mode: selectedMode || undefined,
            limit: 5,
          }
        )
      );
      setNearbySalons(result.data);
    } catch (err) {
      console.error('Failed to load nearby salons', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    if (location && selectedMode) {
      await loadNearbySalons();
    }
    setRefreshing(false);
  };

  // Handle mode selection - navigates to appropriate screens
  const handleModeSelect = (mode: ServiceMode) => {
    setSelectedMode(mode);
    
    if (mode === 'toHome') {
      // Navigate to Home Services screen for home service providers
      navigation.navigate('HomeServices');
    } else if (mode === 'toSalon') {
      // Navigate to Search with toSalon filter
      navigation.navigate('Search', { mode: 'toSalon' });
    }
  };

  const handleCategoryPress = (category: ServiceCategory) => {
    if (category.id === 'all') {
      navigation.navigate('Search', { mode: selectedMode });
    } else {
      navigation.navigate('ServiceListing', { 
        service: category.slug,
        serviceName: category.name,
        mode: selectedMode,
      });
    }
  };

  const handleBannerPress = (banner: any) => {
    if (banner.id === '2') {
      navigation.navigate('HomeServices');
    } else {
      navigation.navigate('Search', { promo: banner.id });
    }
  };

  // Debounced search value
  const debouncedSearch = useDebounce(locationSearch, 300);

  // Search cities from API when debounced value changes
  useEffect(() => {
    if (showLocationPicker && !selectedCity && debouncedSearch.length >= 2) {
      searchCitiesFromAPI(debouncedSearch);
    }
  }, [debouncedSearch, showLocationPicker, selectedCity]);

  // Location picker functions
  const openLocationPicker = async () => {
    setShowLocationPicker(true);
    setCities(INDIAN_CITIES); // Start with predefined cities
  };

  const searchCitiesFromAPI = async (query: string) => {
    setIsLoadingLocations(true);
    try {
      // Try backend first
      const data = await locationService.getCities(query);
      if (data.length > 0) {
        setCities(data);
        setIsLoadingLocations(false);
        return;
      }
    } catch (err) {
      // Fallback to CountriesNow free API
    }

    try {
      // Use CountriesNow API - Free, no API key required
      const response = await fetch(
        'https://countriesnow.space/api/v0.1/countries/cities',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: 'India' }),
        }
      );
      const result = await response.json();
      
      if (result.data) {
        const filtered = result.data
          .filter((cityName: string) => 
            cityName.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 50)
          .map((cityName: string, index: number) => ({
            id: String(index),
            name: cityName,
            slug: cityName.toLowerCase().replace(/\s+/g, '-'),
            state: '',
            country: 'India',
          }));
        setCities(filtered.length > 0 ? filtered : INDIAN_CITIES.filter(c => 
          c.name.toLowerCase().includes(query.toLowerCase())
        ));
      }
    } catch (err) {
      // Fallback to local data
      setCities(INDIAN_CITIES.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase())
      ));
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const loadAreas = async (cityId: string, cityName: string) => {
    setIsLoadingLocations(true);
    try {
      const data = await locationService.getAreas(cityId);
      if (data.length > 0) {
        setAreas(data);
        setIsLoadingLocations(false);
        return;
      }
    } catch (err) {}

    // Use GeoNames free API or generate common area names
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(cityName)}&country=India&format=json&limit=20&addressdetails=1`
      );
      const data = await response.json();
      
      const uniqueAreas = new Set<string>();
      data.forEach((item: any) => {
        const areaName = item.address?.suburb || item.address?.neighbourhood || item.address?.city_district;
        if (areaName && areaName !== cityName) {
          uniqueAreas.add(areaName);
        }
      });

      const areasList: Area[] = Array.from(uniqueAreas).map((name, index) => ({
        id: String(index),
        name: name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        city: cityId,
        cityName: cityName,
        pincode: '',
      }));

      // If no areas found, provide generic options
      if (areasList.length === 0) {
        setAreas([
          { id: '1', name: `${cityName} Central`, slug: `${cityName.toLowerCase()}-central`, city: cityId, cityName, pincode: '' },
          { id: '2', name: `${cityName} East`, slug: `${cityName.toLowerCase()}-east`, city: cityId, cityName, pincode: '' },
          { id: '3', name: `${cityName} West`, slug: `${cityName.toLowerCase()}-west`, city: cityId, cityName, pincode: '' },
          { id: '4', name: `${cityName} North`, slug: `${cityName.toLowerCase()}-north`, city: cityId, cityName, pincode: '' },
          { id: '5', name: `${cityName} South`, slug: `${cityName.toLowerCase()}-south`, city: cityId, cityName, pincode: '' },
        ]);
      } else {
        setAreas(areasList);
      }
    } catch (fallbackErr) {
      // Provide generic areas
      setAreas([
        { id: '1', name: `${cityName} Central`, slug: `${cityName.toLowerCase()}-central`, city: cityId, cityName, pincode: '' },
        { id: '2', name: `${cityName} East`, slug: `${cityName.toLowerCase()}-east`, city: cityId, cityName, pincode: '' },
        { id: '3', name: `${cityName} West`, slug: `${cityName.toLowerCase()}-west`, city: cityId, cityName, pincode: '' },
        { id: '4', name: `${cityName} North`, slug: `${cityName.toLowerCase()}-north`, city: cityId, cityName, pincode: '' },
        { id: '5', name: `${cityName} South`, slug: `${cityName.toLowerCase()}-south`, city: cityId, cityName, pincode: '' },
      ]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const handleCitySelect = async (city: City) => {
    setSelectedCity(city);
    await loadAreas(city.id, city.name);
  };

  const handleAreaSelect = (area: Area) => {
    setManualLocation({ city: selectedCity?.name || '', area: area.name });
    setShowLocationPicker(false);
    setSelectedCity(null);
    setAreas([]);
    setLocationSearch('');
  };

  const handleUseCurrentLocation = async () => {
    setShowLocationPicker(false);
    setManualLocation(null);
    const granted = await requestPermission();
    if (granted) {
      await refreshLocation();
    }
  };

  const getDisplayLocation = () => {
    if (manualLocation) {
      return manualLocation.area || manualLocation.city;
    }
    return location?.city || location?.area || 'Select Location';
  };

  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const filteredAreas = areas.filter(area => 
    area.name.toLowerCase().includes(locationSearch.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Gradient Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            {/* Location & Greeting */}
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={openLocationPicker}
            >
              <Ionicons 
                name={hasPermission || manualLocation ? 'location' : 'location-outline'} 
                size={20} 
                color="#FFF" 
              />
              <View style={styles.locationText}>
                <Text style={styles.deliverTo}>Location</Text>
                <View style={styles.locationRow}>
                  <Text style={styles.locationName} numberOfLines={1}>
                    {getDisplayLocation()}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#FFF" />
                </View>
              </View>
            </TouchableOpacity>

            {/* Right Icons */}
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Ionicons name="notifications-outline" size={24} color="#FFF" />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.navigate('Search', { mode: selectedMode })}
          >
            <Ionicons name="search" size={18} color={colors.textSecondary} />
            <Text style={styles.searchPlaceholder} numberOfLines={1}>Search salons...</Text>
            <View style={styles.searchDivider} />
            <Ionicons name="mic-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[colors.primary]}
            progressViewOffset={20}
          />
        }
        style={styles.scrollView}
      >
        {/* Service Mode Cards */}
        <View style={styles.modeCardsContainer}>
          <TouchableOpacity 
            style={[
              styles.modeCard,
              selectedMode === 'toSalon' && styles.modeCardActive,
            ]}
            onPress={() => handleModeSelect('toSalon')}
          >
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modeCardGradient}
            >
              <View style={styles.modeCardContent}>
                <View style={styles.modeIconContainer}>
                  <MaterialCommunityIcons name="store" size={32} color="#FFF" />
                </View>
                <Text style={styles.modeCardTitle}>To Salon</Text>
                <Text style={styles.modeCardSubtitle}>Visit a salon near you</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.modeCard,
              selectedMode === 'toHome' && styles.modeCardActive,
            ]}
            onPress={() => handleModeSelect('toHome')}
          >
            <LinearGradient
              colors={['#F093FB', '#F5576C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modeCardGradient}
            >
              <View style={styles.modeCardContent}>
                <View style={styles.modeIconContainer}>
                  <MaterialCommunityIcons name="home-heart" size={32} color="#FFF" />
                </View>
                <Text style={styles.modeCardTitle}>To Home</Text>
                <Text style={styles.modeCardSubtitle}>Get services at doorstep</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Banner Carousel */}
        <BannerCarousel onBannerPress={handleBannerPress} />

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Categories', { mode: selectedMode })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <CategoryCarousel 
            categories={categories}
            onCategoryPress={handleCategoryPress}
            selectedMode={selectedMode}
          />
        </View>

        {/* Nearby Salons */}
        {location && nearbySalons.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.nearbyIcon}>
                  <Ionicons name="location" size={16} color={colors.primary} />
                </View>
                <Text style={styles.sectionTitle}>Nearby</Text>
              </View>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Search', { 
                  mode: selectedMode,
                  lat: location.latitude,
                  lng: location.longitude,
                })}
              >
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {nearbySalons.map((salon) => (
                <SalonCardHorizontal
                  key={salon.id}
                  salon={salon}
                  onPress={() => navigation.navigate('SalonDetails', { salonId: salon.id })}
                  showMode={!selectedMode}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Trending Section */}
        {trendingSalons.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.trendingIcon}>
                  <Ionicons name="trending-up" size={16} color="#F59E0B" />
                </View>
                <Text style={styles.sectionTitle}>Trending Now</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Search', { sortBy: 'popular' })}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {trendingSalons.map((salon) => (
                <SalonCardHorizontal
                  key={salon.id}
                  salon={salon}
                  onPress={() => navigation.navigate('SalonDetails', { salonId: salon.id })}
                  showMode={true}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Shorts Section - YouTube/Instagram Reels Style */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.shortsIcon}>
                <MaterialCommunityIcons name="play-box-multiple" size={16} color="#FF0000" />
              </View>
              <Text style={styles.sectionTitle}>Shorts</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Shorts')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ShortsCarousel />
        </View>

        {/* Popular Salons List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedMode === 'toHome' ? 'Home Service Providers' : 'Popular Salons'}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search', { mode: selectedMode })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.salonList}>
            {isLoading && !refreshing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : salons.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="storefront-outline" size={48} color={colors.textLight} />
                <Text style={styles.emptyText}>No salons found</Text>
                <Text style={styles.emptySubtext}>
                  {selectedMode ? 'Try changing the service mode' : 'Pull to refresh'}
                </Text>
              </View>
            ) : (
              salons.slice(0, 5).map((salon) => (
                <SalonCard
                  key={salon.id}
                  salon={salon}
                  onPress={() => navigation.navigate('SalonDetails', { salonId: salon.id })}
                  showMode={!selectedMode}
                  showAudience={true}
                />
              ))
            )}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Location Picker Modal */}
      <Modal
        visible={showLocationPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => {
                  if (selectedCity) {
                    setSelectedCity(null);
                    setAreas([]);
                  } else {
                    setShowLocationPicker(false);
                  }
                }}
              >
                <Ionicons name={selectedCity ? "arrow-back" : "close"} size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {selectedCity ? `Select Area in ${selectedCity.name}` : 'Select Location'}
              </Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Use Current Location */}
            <TouchableOpacity 
              style={styles.currentLocationButton}
              onPress={handleUseCurrentLocation}
            >
              <View style={styles.currentLocationIcon}>
                <Ionicons name="navigate" size={20} color={colors.primary} />
              </View>
              <View style={styles.currentLocationText}>
                <Text style={styles.currentLocationTitle}>Use Current Location</Text>
                <Text style={styles.currentLocationSubtitle}>Enable GPS for accurate location</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            {/* Search Input */}
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder={selectedCity ? "Search area..." : "Search city..."}
                placeholderTextColor={colors.textLight}
                value={locationSearch}
                onChangeText={setLocationSearch}
              />
              {locationSearch.length > 0 && (
                <TouchableOpacity onPress={() => setLocationSearch('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textLight} />
                </TouchableOpacity>
              )}
            </View>

            {/* Location List */}
            {isLoadingLocations ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : selectedCity ? (
              <FlatList
                data={filteredAreas}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.locationItem}
                    onPress={() => handleAreaSelect(item)}
                  >
                    <Ionicons 
                      name="location-outline"
                      size={20} 
                      color={colors.textSecondary} 
                    />
                    <View style={styles.locationItemText}>
                      <Text style={styles.locationItemTitle}>{item.name}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No areas found</Text>
                  </View>
                }
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <FlatList
                data={filteredCities}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.locationItem}
                    onPress={() => handleCitySelect(item)}
                  >
                    <Ionicons 
                      name="business-outline"
                      size={20} 
                      color={colors.textSecondary} 
                    />
                    <View style={styles.locationItemText}>
                      <Text style={styles.locationItemTitle}>{item.name}</Text>
                      {item.state && (
                        <Text style={styles.locationItemSubtitle}>{item.state}</Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No cities found</Text>
                  </View>
                }
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    paddingBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  deliverTo: {
    fontSize: typography.caption.fontSize,
    color: 'rgba(255,255,255,0.7)',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationName: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: '#FFF',
    marginRight: spacing.xs,
    maxWidth: 150,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.xs,
    ...shadows.sm,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  searchDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  scrollView: {
    flex: 1,
  },
  // Mode Cards
  modeCardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  modeCard: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  modeCardActive: {
    transform: [{ scale: 1.02 }],
  },
  modeCardGradient: {
    padding: spacing.lg,
    minHeight: 140,
  },
  modeCardContent: {
    alignItems: 'center',
  },
  modeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modeCardTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: '#FFF',
  },
  modeCardSubtitle: {
    fontSize: typography.caption.fontSize,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
  // Sections
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text,
  },
  seeAll: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.primary,
    fontWeight: '600',
  },
  nearbyIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendingIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shortsIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFE4E4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalScrollContent: {
    paddingHorizontal: spacing.md,
  },
  salonList: {
    paddingHorizontal: spacing.md,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  currentLocationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  currentLocationText: {
    flex: 1,
  },
  currentLocationTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.primary,
  },
  currentLocationSubtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.text,
    paddingVertical: 0,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  locationItemText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  locationItemTitle: {
    fontSize: typography.body.fontSize,
    color: colors.text,
    fontWeight: '500',
  },
  locationItemSubtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default HomeScreen;
