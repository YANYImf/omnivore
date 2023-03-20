package app.omnivore.omnivore.ui.settings

import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.Switch
import androidx.compose.material.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import app.omnivore.omnivore.ui.reader.Stepper
import app.omnivore.omnivore.ui.reader.WebFont
import app.omnivore.omnivore.ui.reader.WebPreferencesView
import app.omnivore.omnivore.ui.reader.WebReaderViewModel

@Composable
fun ManageAccountDialog(onDismiss: () -> Unit, settingsViewModel: SettingsViewModel) {
  Dialog(onDismissRequest = { onDismiss() }) {
    Surface(
      shape = RoundedCornerShape(16.dp),
      color = Color.White,
      modifier = Modifier
        .height(300.dp)
    ) {
      ManageAccountView(settingsViewModel = settingsViewModel)
    }
  }
}

@Composable
fun ManageAccountView(settingsViewModel: SettingsViewModel) {
//  val currentWebPreferences = webReaderViewModel.storedWebPreferences(isSystemInDarkTheme())
//  val isFontListExpanded = remember { mutableStateOf(false) }
//  val highContrastTextSwitchState = remember { mutableStateOf(currentWebPreferences.prefersHighContrastText) }
//  val selectedWebFontRawValue = remember { mutableStateOf(currentWebPreferences.fontFamily.rawValue) }

  Column(
    modifier = Modifier
      .padding(top = 6.dp, start = 6.dp, end = 6.dp, bottom = 6.dp)
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(top = 12.dp, bottom = 12.dp),
      horizontalArrangement = Arrangement.Center
    ) {
      Text("Manage Account")
    }

    Column(
      modifier = Modifier
        .verticalScroll(rememberScrollState())
    ) {
      Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
          .clickable(onClick = { settingsViewModel.resetDataCache() })
      ) {
        Text("Reset Data Cache")
        Spacer(modifier = Modifier.weight(1.0F))
        Icon(imageVector = Icons.Filled.Refresh, contentDescription = null)
      }
    }
  }
}

