import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class ProfileContainerViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var profileCardData = ProfileCardData()
  @Published var deleteAccountErrorMessage: String?

  var appVersionString: String {
    if let appVersion = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String {
      return "Omnivore Version \(appVersion)"
    } else {
      return ""
    }
  }

  func loadProfileData(dataService: DataService) async {
    if let currentViewer = dataService.currentViewer,
       let name = currentViewer.name,
       let username = currentViewer.username
    {
      loadProfileCardData(name: name, username: username, profileImageURL: currentViewer.profileImageURL)
    }

    if let viewer = try? await dataService.fetchViewer() {
      loadProfileCardData(name: viewer.name, username: viewer.username, profileImageURL: viewer.profileImageURL)
    }
  }

  func deleteAccount(dataService: DataService, authenticator: Authenticator) async {
    guard let currentViewer = dataService.currentViewer else {
      deleteAccountErrorMessage = "Unable to load account information."
      return
    }

    do {
      try await dataService.deleteAccount(userID: currentViewer.unwrappedUserID)
      authenticator.logout(dataService: dataService, isAccountDeletion: true)
      EventTracker.reset()
    } catch {
      deleteAccountErrorMessage = "We were unable to delete your account."
    }
  }

  private func loadProfileCardData(name: String, username: String, profileImageURL: String?) {
    profileCardData = ProfileCardData(
      name: name,
      username: username,
      imageURL: profileImageURL.flatMap { URL(string: $0) }
    )
  }
}

struct ProfileView: View {
  @EnvironmentObject var authenticator: Authenticator
  @EnvironmentObject var dataService: DataService
  @Environment(\.openURL) var openURL
  @Environment(\.dismiss) var dismiss

  @StateObject private var viewModel = ProfileContainerViewModel()

  @State private var showLogoutConfirmation = false

  var body: some View {
    #if os(iOS)
      Form {
        innerBody
      }
      .navigationTitle(LocalText.genericProfile)
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .navigationBarTrailing) {
          dismissButton
        }
      }
    #elseif os(macOS)
      List {
        innerBody
      }
      .listStyle(InsetListStyle())
      .frame(minWidth: 400, minHeight: 600)
    #endif
  }

  var dismissButton: some View {
    Button(
      action: { dismiss() },
      label: { Text(LocalText.genericClose) }
    )
  }

  private var accountSection: some View {
    Section {
      NavigationLink(destination: LabelsView()) {
        Text(LocalText.labelsGeneric)
      }

      NavigationLink(destination: NewsletterEmailsView()) {
        Text(LocalText.emailsGeneric)
      }

      NavigationLink(destination: SubscriptionsView()) {
        Text(LocalText.subscriptionsGeneric)
      }

      #if os(iOS)
        NavigationLink(destination: GroupsView()) {
          Text(LocalText.clubsGeneric)
        }
      #endif

      NavigationLink(destination: FiltersView()) {
        Text(LocalText.filtersGeneric)
      }
    }
  }

  private var innerBody: some View {
    Group {
      Section {
        ProfileCard(data: viewModel.profileCardData)
          .task {
            await viewModel.loadProfileData(dataService: dataService)
          }
      }

      accountSection

      #if os(iOS)
        Section {
          NavigationLink(destination: PushNotificationSettingsView()) {
            Text(LocalText.pushNotificationsGeneric)
          }
          NavigationLink(destination: TextToSpeechView()) {
            Text(LocalText.textToSpeechGeneric)
          }
        }
      #endif

      Section {
        Button(
          action: {
            if let url = URL(string: "https://docs.omnivore.app") {
              openURL(url)
            }
          },
          label: { Text(LocalText.documentationGeneric) }
        )

        #if os(iOS)
          Button(
            action: { DataService.showIntercomMessenger?() },
            label: { Text(LocalText.feedbackGeneric) }
          )
        #endif

        Button(
          action: {
            if let url = URL(string: "https://omnivore.app/privacy") {
              openURL(url)
            }
          },
          label: { Text(LocalText.privacyPolicyGeneric) }
        )

        Button(
          action: {
            if let url = URL(string: "https://omnivore.app/terms") {
              openURL(url)
            }
          },
          label: { Text(LocalText.termsAndConditionsGeneric) }
        )
      }

      Section(footer: Text(viewModel.appVersionString)) {
        NavigationLink(
          destination: ManageAccountView()
        ) {
          Text(LocalText.manageAccountGeneric)
        }

        Text(LocalText.logoutGeneric)
          .onTapGesture {
            showLogoutConfirmation = true
          }
          .alert(isPresented: $showLogoutConfirmation) {
            Alert(
              title: Text(LocalText.profileConfirmLogoutMessage),
              primaryButton: .destructive(Text(LocalText.genericConfirm)) {
                dismiss()
                DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(100)) {
                  authenticator.logout(dataService: dataService)
                }
              },
              secondaryButton: .cancel()
            )
          }
      }
    }
  }
}

extension BasicWebAppView {
  static func privacyPolicyWebView(baseURL: URL) -> BasicWebAppView {
    omnivoreWebView(path: "/privacy", baseURL: baseURL)
  }

  static func termsConditionsWebView(baseURL: URL) -> BasicWebAppView {
    omnivoreWebView(path: "/terms", baseURL: baseURL)
  }

  private static func omnivoreWebView(path: String, baseURL: URL) -> BasicWebAppView {
    let url: URL = {
      var urlComponents = URLComponents()
      urlComponents.path = path
      return urlComponents.url(relativeTo: baseURL)!
    }()

    return BasicWebAppView(request: URLRequest(url: url))
  }
}
