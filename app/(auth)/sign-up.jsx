import { View, Text, ScrollView, Image, Alert } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../constants';
import FormField from '../../components/FormField';
import CusButton from '../../components/CusButton';
import { Link, useRouter } from 'expo-router';
import { createUser } from '../../lib/appwrite';
import { useGlobalContext } from '../../context/GlobalProvider'; 
import { getCurrentUser } from '../../lib/appwrite';

const SignUp = () => {

  const { setUser, setIsLogged } = useGlobalContext();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const submit = async () => {
    if (!form.username || !form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all the Fields');
      return;
    }
    
    setSubmitting(true);

    try {
      const result = await createUser(form.email, form.password, form.username);
      setUser(result);
      setIsLogged(true);

      router.replace("/home");
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formFields = [
    { title: 'Username', value: form.username, key: 'username' },
    { title: 'Email', value: form.email, key: 'email', keyboardType: 'email-address' },
    { title: 'Password', value: form.password, key: 'password', keyboardType: 'default' }
  ];

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center px-4 my-6 min-h-[85vh]">
          <Image source={images.logo} resizeMode="contain" className="mt-5 w-[115px] h-[35px] mb-6" />
          <Text className="text-2xl font-semibold text-white mt-5">Sign up to Aora</Text>
          
          {formFields.map(({ title, value, key, keyboardType }, index) => (
            <FormField
              key={index}
              title={title}
              value={value}
              handleChangeText={(text) => setForm({ ...form, [key]: text })}
              otherStyles={index === 0 ? "mt-10" : "mt-7"}
              keyboardType={keyboardType}
            />
          ))}

          <CusButton
            title="Sign Up"
            handlePress={submit}
            containerStyles="mt-7"
            isLoadinng={submitting}
          />
          
          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Already have an account?
            </Text>
            <Link href="/sign-in" className='text-[18px] text-secondary'>Log In</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default SignUp;
