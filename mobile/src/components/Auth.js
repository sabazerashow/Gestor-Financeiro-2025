import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image, StatusBar } from 'react-native';
import { supabase } from '../lib/supabase';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import * as WebBrowser from 'expo-web-browser';
import { Squircle } from '../components/common/Squircle';

WebBrowser.maybeCompleteAuthSession();

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    async function handleGoogleSignIn() {
        Alert.alert(
            'Google Sign-In',
            'Siga as instruções para configurar o OAuth no Google Cloud e Supabase para liberar o login social.',
            [{ text: 'Entendido' }]
        );
    }

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) Alert.alert('Erro', error.message);
        setLoading(false);
    }

    async function signUpWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) Alert.alert('Erro', error.message);
        else Alert.alert('Sucesso', 'Verifique seu e-mail para confirmar o cadastro.');
        setLoading(false);
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={styles.header}>
                    <Squircle color="rgba(255,255,255,0.1)" size={64}>
                        <Text style={styles.logoText}>FP</Text>
                    </Squircle>
                    <Text style={styles.welcomeText}>{isLogin ? 'Bom te ver!' : 'Junte-se a nós'}</Text>
                    <Text style={styles.subtitleText}>Controle financeiro no nível inteligente.</Text>
                </View>

                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>E-mail</Text>
                        <TextInput
                            onChangeText={setEmail}
                            value={email}
                            placeholder="exemplo@finance.com"
                            autoCapitalize={'none'}
                            style={styles.input}
                            placeholderTextColor="#94A3B8"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Senha</Text>
                        <TextInput
                            onChangeText={setPassword}
                            value={password}
                            secureTextEntry={true}
                            placeholder="Sua senha"
                            autoCapitalize={'none'}
                            style={styles.input}
                            placeholderTextColor="#94A3B8"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.loginButton}
                        disabled={loading}
                        onPress={() => (isLogin ? signInWithEmail() : signUpWithEmail())}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.secondary} />
                        ) : (
                            <Text style={styles.loginButtonText}>{isLogin ? 'Entrar' : 'Começar Agora'}</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.line} />
                        <Text style={styles.orText}>ou</Text>
                        <View style={styles.line} />
                    </View>

                    <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
                        <Image
                            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
                            style={styles.googleIcon}
                        />
                        <Text style={styles.googleButtonText}>Entrar com Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={() => setIsLogin(!isLogin)}
                    >
                        <Text style={styles.toggleText}>
                            {isLogin ? 'Novo por aqui? ' : 'Já tem conta? '}
                            <Text style={styles.toggleTextBold}>{isLogin ? 'Criar conta' : 'Fazer login'}</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.secondary,
    },
    content: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    header: {
        paddingHorizontal: SPACING.xl,
        marginBottom: SPACING.xl,
        alignItems: 'center',
    },
    logoText: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.primary,
        letterSpacing: -1,
    },
    welcomeText: {
        ...TYPOGRAPHY.h1,
        color: '#FFFFFF',
        marginTop: SPACING.md,
        textAlign: 'center',
    },
    subtitleText: {
        ...TYPOGRAPHY.body,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        marginTop: 4,
    },
    formCard: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: SPACING.xl,
        paddingTop: SPACING.xxl,
        ...SHADOWS.medium,
    },
    inputGroup: {
        marginBottom: SPACING.lg,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94A3B8',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#0F172A',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginTop: SPACING.sm,
        ...SHADOWS.small,
    },
    loginButtonText: {
        color: COLORS.secondary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SPACING.xl,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#1E293B',
    },
    orText: {
        marginHorizontal: 16,
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '600',
    },
    googleButton: {
        backgroundColor: '#161B22',
        borderWidth: 1.5,
        borderColor: '#1E293B',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    googleIcon: {
        width: 22,
        height: 22,
        marginRight: 12,
    },
    googleButtonText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
    },
    toggleButton: {
        marginTop: SPACING.xl,
        marginBottom: Platform.OS === 'ios' ? 20 : 0,
        alignItems: 'center',
    },
    toggleText: {
        color: COLORS.textSecondary,
        fontSize: 15,
    },
    toggleTextBold: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});
