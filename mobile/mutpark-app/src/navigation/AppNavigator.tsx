import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '@/hooks/redux';

// Screens
import SplashScreen from '@/screens/SplashScreen';
import OnboardingScreen from '@/screens/OnboardingScreen';
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import HomeScreen from '@/screens/home/HomeScreen';
import ProductsScreen from '@/screens/products/ProductsScreen';
import ProductDetailScreen from '@/screens/products/ProductDetailScreen';
import CartScreen from '@/screens/cart/CartScreen';
import CheckoutScreen from '@/screens/checkout/CheckoutScreen';
import CommunityScreen from '@/screens/community/CommunityScreen';
import RecipeDetailScreen from '@/screens/community/RecipeDetailScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import BookmarksScreen from '@/screens/bookmarks/BookmarksScreen';
import OrdersScreen from '@/screens/orders/OrdersScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';

// Types
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  ProductDetail: { productId: string };
  RecipeDetail: { recipeId: string };
  Checkout: undefined;
  Orders: undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Products: undefined;
  Community: undefined;
  Bookmarks: undefined;
  Profile: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Products':
              iconName = focused ? 'storefront' : 'storefront-outline';
              break;
            case 'Community':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Bookmarks':
              iconName = focused ? 'bookmark' : 'bookmark-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#dc2626',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'ホーム' }}
      />
      <MainTab.Screen
        name="Products"
        component={ProductsScreen}
        options={{ tabBarLabel: '商品' }}
      />
      <MainTab.Screen
        name="Community"
        component={CommunityScreen}
        options={{ tabBarLabel: 'コミュニティ' }}
      />
      <MainTab.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{ tabBarLabel: 'ブックマーク' }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'プロフィール' }}
      />
    </MainTab.Navigator>
  );
}

export function AppNavigator() {
  const { isInitialized, user, hasSeenOnboarding } = useAppSelector((state) => ({
    isInitialized: state.app.isInitialized,
    user: state.auth.user,
    hasSeenOnboarding: state.app.hasSeenOnboarding,
  }));

  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#ffffff' },
        }}
      >
        {!isInitialized ? (
          <RootStack.Screen name="Splash" component={SplashScreen} />
        ) : !hasSeenOnboarding ? (
          <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !user ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <RootStack.Screen name="Main" component={MainNavigator} />
            <RootStack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{
                headerShown: true,
                headerTitle: '',
                headerBackTitleVisible: false,
                headerStyle: {
                  backgroundColor: '#ffffff',
                  elevation: 0,
                  shadowOpacity: 0,
                },
              }}
            />
            <RootStack.Screen
              name="RecipeDetail"
              component={RecipeDetailScreen}
              options={{
                headerShown: true,
                headerTitle: '',
                headerBackTitleVisible: false,
                headerStyle: {
                  backgroundColor: '#ffffff',
                  elevation: 0,
                  shadowOpacity: 0,
                },
              }}
            />
            <RootStack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{
                headerShown: true,
                headerTitle: 'チェックアウト',
                headerBackTitleVisible: false,
                headerStyle: {
                  backgroundColor: '#ffffff',
                },
              }}
            />
            <RootStack.Screen
              name="Orders"
              component={OrdersScreen}
              options={{
                headerShown: true,
                headerTitle: '注文履歴',
                headerBackTitleVisible: false,
                headerStyle: {
                  backgroundColor: '#ffffff',
                },
              }}
            />
            <RootStack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                headerShown: true,
                headerTitle: '設定',
                headerBackTitleVisible: false,
                headerStyle: {
                  backgroundColor: '#ffffff',
                },
              }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}