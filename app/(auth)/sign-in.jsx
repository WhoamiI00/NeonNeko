import { View, Text, ScrollView, Image, Alert } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../constants';
import FormField from '../../components/FormField';
import CusButton from '../../components/CusButton';
import { Link, useRouter } from 'expo-router';
import { getCurrentUser, signIn } from '../../lib/appwrite'; 
import { useGlobalContext } from '../../context/GlobalProvider'; 

const SignIn = () => {
  const { setUser, setIsLogged } = useGlobalContext();

  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleInputChange = (field, value) => {
    setForm(prevForm => ({ ...prevForm, [field]: value }));
  };

  const submit = async () => {
    const { email, password } = form;

    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all the fields');
      return;
    }

    setSubmitting(true);

    try {
      await signIn(form.email, form.password);
      const result = await getCurrentUser();
      setUser(result);
      setIsLogged(true);

      Alert.alert("Success", "User signed in successfully");
      router.replace("/home");
    } catch (error) {
      Alert.alert('Error', error.message || 'Sign-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
        <View className="w-full justify-center px-4 my-6">
          <Image source={images.logo} resizeMode="contain" className="w-[115px] h-[35px] mb-6" />
          <Text className="text-2xl font-semibold text-white">Log in to Aora</Text>

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => handleInputChange('email', e)}
            otherStyles="mt-7"
            keyboardType="email-address"
            autoCapitalize="none" 
          />
          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => handleInputChange('password', e)}
            otherStyles="mt-7"
            keyboardType="default"
            secureTextEntry
          />
          <CusButton
            title="Sign In"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={submitting} 
          />
          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Don’t have an account?
            </Text>
            <Link href="/sign-up" className='text-[18px] text-secondary'>Sign Up</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default SignIn;
